import React from 'react';
import styled from 'styled-components';
import type { RecordingTimerProps } from './types';

const TimerText = styled.div`
  font-size: 1.1rem;
  font-weight: 900;
  color: #4b5563;
`;

const RecordingTimer: React.FC<RecordingTimerProps> = ({ duration, maxDuration }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TimerText>
      {formatTime(duration)}
    </TimerText>
  );
};

export { RecordingTimer };