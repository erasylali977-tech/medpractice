# RAG Architecture Plan для MedPractice AI Mentor

## Обзор

План архитектуры RAG (Retrieval-Augmented Generation) для интеграции MedElement API и PubMed API в систему AI Mentor.

## Текущая архитектура (MVP)

```
User Question → AI Provider (Gemini/Claude/OpenAI) → Response
```

## Будущая архитектура с RAG

```
User Question 
  ↓
Query Embedding (Vectorization)
  ↓
Vector Search (Pinecone/Weaviate/Chroma)
  ↓
Retrieve Relevant Sources (MedElement + PubMed)
  ↓
Rank & Filter Sources
  ↓
Generate Answer with Context (AI Provider)
  ↓
Format Response with Citations
```

## Компоненты системы

### 1. Data Sources (Источники данных)

#### MedElement API
- **Тип**: Протоколы МЗ РК
- **Формат**: JSON/HTML
- **Приоритет**: Tier 1 (высший)
- **Доступ**: Требуется API ключ
- **Структура данных**:
  ```javascript
  {
    id: "protocol_id",
    title: "Название протокола",
    content: "Текст протокола",
    category: "категория",
    date: "дата",
    url: "ссылка"
  }
  ```

#### PubMed API
- **Тип**: Научные статьи
- **Формат**: XML/JSON
- **Приоритет**: Tier 2
- **Доступ**: Бесплатный (с лимитами)
- **Endpoints**:
  - `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` - поиск
  - `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi` - получение

### 2. Vector Database

**Рекомендуемое решение**: Pinecone или Weaviate

**Схема документа**:
```javascript
{
  id: "doc_uuid",
  title: "Название",
  content: "Текст для поиска",
  embedding: [0.123, 0.456, ...], // 1536-мерный вектор
  metadata: {
    source: "medelement" | "pubmed",
    type: "protocol" | "article",
    category: "кардиология",
    date: "2024-01-01",
    url: "ссылка",
    isPaid: false,
    priority: 1 | 2
  }
}
```

### 3. Embedding Model

**Варианты**:
- **OpenAI text-embedding-3-small** (1536 dim) - рекомендуется
- **OpenAI text-embedding-3-large** (3072 dim) - для большей точности
- **Anthropic Embeddings** (если будет доступен)
- **Open-source**: Sentence Transformers (multi-lingual)

### 4. RAG Pipeline

#### Шаг 1: Query Processing
```javascript
async function processQuery(userQuestion, mentorId) {
  // 1. Расширение запроса (query expansion)
  const expandedQuery = await expandQuery(userQuestion, mentorId);
  
  // 2. Создание embedding
  const queryEmbedding = await createEmbedding(expandedQuery);
  
  return queryEmbedding;
}
```

#### Шаг 2: Retrieval (Поиск)
```javascript
async function retrieveSources(queryEmbedding, options) {
  const { includePaid = false, limit = 5, priorityRegions = ['KZ'] } = options;
  
  // Поиск в векторной БД
  const results = await vectorDB.query({
    vector: queryEmbedding,
    topK: limit * 2, // Получаем больше для фильтрации
    filter: {
      $or: [
        { 'metadata.priority': 1 }, // Протоколы МЗ РК
        { 'metadata.isPaid': !includePaid ? false : undefined }
      ]
    },
    includeMetadata: true
  });
  
  // Фильтрация и ранжирование
  const filtered = filterSources(results, {
    includePaid,
    priorityRegions
  });
  
  // Re-ranking по релевантности
  const ranked = await rerankSources(queryEmbedding, filtered);
  
  return ranked.slice(0, limit);
}
```

#### Шаг 3: Context Building
```javascript
function buildContext(sources, question) {
  const contextText = sources.map((source, idx) => {
    return `[Источник ${idx + 1}]: ${source.metadata.title}
URL: ${source.metadata.url}
Содержание: ${source.content.substring(0, 500)}...
---
`;
  }).join('\n');
  
  return {
    context: contextText,
    sources: sources.map(s => ({
      title: s.metadata.title,
      url: s.metadata.url,
      type: s.metadata.type,
      excerpt: s.content.substring(0, 200),
      isPaid: s.metadata.isPaid || false
    }))
  };
}
```

#### Шаг 4: Generation
```javascript
async function generateAnswer(question, context, mentorPrompt) {
  const systemPrompt = `${mentorPrompt}

ВАЖНО: Ты ДОЛЖЕН отвечать, основываясь ТОЛЬКО на предоставленных источниках.
Если в источниках нет ответа - честно скажи об этом.
Всегда указывай ссылки на использованные источники.`;

  const userMessage = `Контекст из источников:
${context.context}

Вопрос пользователя: ${question}

Ответь согласно своей роли, обязательно укажи использованные источники в формате [Название](URL).`;

  return await callAIProvider(userMessage, systemPrompt);
}
```

### 5. Data Ingestion (Загрузка данных)

#### MedElement Data Ingestion
```javascript
async function ingestMedElementProtocols(apiKey) {
  // 1. Получение списка протоколов
  const protocols = await medElementAPI.listProtocols(apiKey);
  
  // 2. Обработка каждого протокола
  for (const protocol of protocols) {
    // 2.1. Получение полного текста
    const content = await medElementAPI.getProtocol(protocol.id, apiKey);
    
    // 2.2. Чистка и обработка текста
    const cleanedContent = cleanText(content);
    
    // 2.3. Создание embedding
    const embedding = await createEmbedding(cleanedContent);
    
    // 2.4. Сохранение в векторную БД
    await vectorDB.upsert({
      id: `medelement_${protocol.id}`,
      values: embedding,
      metadata: {
        source: 'medelement',
        type: 'protocol',
        title: protocol.title,
        category: protocol.category,
        date: protocol.date,
        url: protocol.url,
        content: cleanedContent,
        isPaid: false,
        priority: 1
      }
    });
  }
}
```

#### PubMed Data Ingestion
```javascript
async function ingestPubMedArticles(query, maxResults = 100) {
  // 1. Поиск статей
  const searchResults = await pubmedAPI.search({
    term: query,
    maxResults: maxResults,
    sort: 'relevance'
  });
  
  // 2. Получение полных текстов (если доступны)
  for (const article of searchResults) {
    const fullText = await pubmedAPI.fetchFullText(article.pmid);
    
    if (fullText) {
      // Обработка аналогично MedElement
      const embedding = await createEmbedding(fullText);
      await vectorDB.upsert({
        id: `pubmed_${article.pmid}`,
        values: embedding,
        metadata: {
          source: 'pubmed',
          type: 'article',
          title: article.title,
          authors: article.authors,
          journal: article.journal,
          date: article.date,
          url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`,
          content: fullText,
          isPaid: false,
          priority: 2
        }
      });
    }
  }
}
```

## Реализация

### Структура файлов

```
server/
  src/
    services/
      rag/
        embeddingService.js      # Создание embeddings
        vectorDBService.js       # Работа с векторной БД
        retrievalService.js      # Поиск релевантных источников
        rankingService.js        # Ранжирование результатов
        medElementService.js     # Интеграция с MedElement
        pubmedService.js         # Интеграция с PubMed
        ingestionService.js      # Загрузка данных
      aiMentorRAG.js             # Главный RAG сервис
```

### Пример использования

```javascript
// server/src/services/aiMentorRAG.js
import { processQuery } from './rag/embeddingService.js';
import { retrieveSources } from './rag/retrievalService.js';
import { buildContext } from './rag/contextBuilder.js';
import { generateAnswer } from './rag/generationService.js';

export async function getMentorAnswerWithRAG(question, mentorId, userId) {
  // 1. Обработка запроса
  const queryEmbedding = await processQuery(question, mentorId);
  
  // 2. Поиск источников
  const user = await getUserById(userId);
  const sources = await retrieveSources(queryEmbedding, {
    includePaid: user.subscription?.planId === 'plus',
    limit: 5,
    priorityRegions: ['KZ']
  });
  
  // 3. Построение контекста
  const context = buildContext(sources, question);
  
  // 4. Генерация ответа
  const mentorPrompt = getMentorPrompt(mentorId);
  const answer = await generateAnswer(question, context, mentorPrompt);
  
  return {
    answer,
    sources: context.sources
  };
}
```

## Конфигурация

### Environment Variables

```env
# Embedding Model
EMBEDDING_MODEL=openai
EMBEDDING_MODEL_NAME=text-embedding-3-small
OPENAI_EMBEDDING_API_KEY=sk-...

# Vector Database
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=medpractice-docs

# MedElement API
MEDELEMENT_API_KEY=...
MEDELEMENT_API_URL=https://api.medelement.com

# PubMed API (не требует ключа, но лучше зарегистрироваться)
PUBMED_EMAIL=your@email.com
PUBMED_API_KEY=... # Опционально для увеличения лимитов
```

## Этапы внедрения

### Phase 1: Базовая инфраструктура (2-3 недели)
- [ ] Настройка векторной БД (Pinecone/Weaviate)
- [ ] Интеграция embedding модели
- [ ] Базовый RAG pipeline без внешних источников
- [ ] Тестирование на существующих данных

### Phase 2: MedElement Integration (3-4 недели)
- [ ] Получение API ключа MedElement
- [ ] Реализация MedElement сервиса
- [ ] Загрузка протоколов МЗ РК
- [ ] Индексация в векторной БД
- [ ] Интеграция в RAG pipeline

### Phase 3: PubMed Integration (2-3 недели)
- [ ] Реализация PubMed сервиса
- [ ] Загрузка релевантных статей
- [ ] Индексация в векторной БД
- [ ] Приоритизация (протоколы > статьи)

### Phase 4: Optimization (2 недели)
- [ ] Re-ranking источников
- [ ] Кэширование частых запросов
- [ ] Оптимизация качества ответов
- [ ] Мониторинг и метрики

## Метрики качества

1. **Relevance Score** - релевантность найденных источников
2. **Answer Quality** - качество ответов (человеческая оценка)
3. **Source Citation Accuracy** - точность ссылок на источники
4. **Response Time** - время ответа (цель < 3 сек)
5. **User Satisfaction** - удовлетворенность пользователей

## Безопасность и лимиты

- **Rate Limiting**: Ограничение запросов к API
- **Caching**: Кэширование для экономии токенов
- **Filtering**: Фильтрация платного контента
- **Audit Logging**: Логирование всех запросов
- **Data Privacy**: Не хранить персональные данные

## Стоимость

### Embedding
- OpenAI text-embedding-3-small: $0.02 / 1M tokens
- Пример: 1000 запросов/день × 500 токенов = $0.01/день

### Vector DB
- Pinecone: ~$70/месяц (Starter plan)
- Weaviate Cloud: ~$25/месяц (Starter)

### MedElement API
- Зависит от тарифного плана (уточнить у MedElement)

### PubMed API
- Бесплатно (с лимитами)
- С регистрацией: увеличенные лимиты

**Итоговая оценка**: ~$100-150/месяц для MVP

## Готовность к реализации

✅ **Архитектура готова** - можно начать реализацию как только будут доступны:
- MedElement API ключ
- Доступ к PubMed API
- Бюджет на векторную БД

Могу организовать всю архитектуру и систему RAG когда будут готовы API ключи! 🚀



