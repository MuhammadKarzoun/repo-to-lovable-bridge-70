
import React from 'react';
import styled from 'styled-components';
import type { RecordingTimerProps } from './types';

const TimerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TimerText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  font-variant-numeric: tabular-nums;
`;

const RecordingDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const RecordingTimer: React.FC<RecordingTimerProps> = ({ duration, maxDuration }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const remaining = maxDuration - duration;
  const isNearingLimit = remaining <= 30;

  return (
    <TimerContainer>
      <RecordingDot />
      <TimerText style={{ color: isNearingLimit ? '#ef4444' : '#374151' }}>
        {formatTime(duration)}
      </TimerText>
    </TimerContainer>
  );
};
