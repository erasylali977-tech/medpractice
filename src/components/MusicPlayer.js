import React, { useState, useEffect, useRef, useCallback } from 'react';

// YouTube video ID from the provided URL: https://youtu.be/PbeVJEXXHuM
const YOUTUBE_VIDEO_ID = 'PbeVJEXXHuM';

const MusicPlayer = () => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [playerReady, setPlayerReady] = useState(false);

  const handleMusicToggle = useCallback((event) => {
    const shouldPlay = event.detail;
    if (!playerRef.current || !playerReady) return;

    try {
      if (shouldPlay) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } else {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling music:', error);
    }
  }, [playerReady]);

  const handleVolumeChange = useCallback((event) => {
    const newVolume = event.detail;
    if (!playerRef.current || !playerReady) return;
    
    try {
      playerRef.current.setVolume(newVolume * 100);
      setVolume(newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  }, [playerReady]);

  // Load YouTube IFrame API
  useEffect(() => {
    let scriptLoaded = false;

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return; // Already initialized

      try {
        playerRef.current = new window.YT.Player('youtube-music-player', {
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onReady: (event) => {
              setPlayerReady(true);
              const savedVolume = localStorage.getItem('musicVolume');
              const vol = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
              event.target.setVolume(vol * 100);
              setVolume(vol);
              
              // Load saved play state
              const savedEnabled = localStorage.getItem('musicEnabled');
              if (savedEnabled === 'true') {
                event.target.playVideo();
                setIsPlaying(true);
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data);
            },
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    // Check if script is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      scriptLoaded = true;
    } else {
      // Load YouTube IFrame API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Initialize player when API is ready
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
        scriptLoaded = true;
      };
    }

    // Set up event listeners
    window.addEventListener('musicToggle', handleMusicToggle);
    window.addEventListener('musicVolumeChange', handleVolumeChange);

    return () => {
      window.removeEventListener('musicToggle', handleMusicToggle);
      window.removeEventListener('musicVolumeChange', handleVolumeChange);
      
      if (playerRef.current && scriptLoaded) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
        playerRef.current = null;
      }
    };
  }, [handleMusicToggle, handleVolumeChange]);

  return (
    <div style={{ display: 'none' }}>
      <div id="youtube-music-player"></div>
    </div>
  );
};

// Export hooks for controlling music from other components
export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(() => {
    const saved = localStorage.getItem('musicEnabled');
    return saved !== null ? saved === 'true' : false;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved !== null ? parseFloat(saved) : 0.3;
  });

  const toggleMusic = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('musicEnabled', newState.toString());
    // Trigger custom event for MusicPlayer component
    window.dispatchEvent(new CustomEvent('musicToggle', { detail: newState }));
  };

  const updateVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    localStorage.setItem('musicVolume', clampedVolume.toString());
    // Trigger custom event for MusicPlayer component
    window.dispatchEvent(new CustomEvent('musicVolumeChange', { detail: clampedVolume }));
  };

  return { isPlaying, volume, toggleMusic, updateVolume };
};

export default MusicPlayer;

