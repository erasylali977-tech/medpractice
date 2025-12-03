import React, { useState } from 'react';
import MentorSelection from './MentorSelection';
import MentorChat from './MentorChat';
import './AIMentor.css';

const AIMentor = ({ userData }) => {
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleBackToSelection = () => {
    setSelectedMentor(null);
  };

  return (
    <div className="ai-mentor-container">
      {!selectedMentor ? (
        <MentorSelection onSelectMentor={handleSelectMentor} />
      ) : (
        <MentorChat 
          mentor={selectedMentor}
          onBack={handleBackToSelection}
          userData={userData}
        />
      )}
    </div>
  );
};

export default AIMentor;



