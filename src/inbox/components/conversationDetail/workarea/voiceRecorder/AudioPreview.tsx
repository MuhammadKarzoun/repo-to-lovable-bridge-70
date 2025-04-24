
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import type { AudioPreviewProps } from './types';
import { Play, Pause, Send, X } from 'lucide-react';
import Tip from '@octobots/ui/src/components/Tip';
import { __ } from 'coreui/utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.75rem;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ $variant?: 'primary' | 'danger' | 'default' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: none;
  transition: all 0.2s ease-in-out;
  background-color: ${props => 
    props.$variant === 'primary' ? '#3b82f6' :
    props.$variant === 'danger' ? '#ef4444' :
    '#ffffff'};
  color: ${props => props.$variant ? '#ffffff' : '#374151'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid ${props => 
    props.$variant === 'primary' ? '#2563eb' :
    props.$variant === 'danger' ? '#dc2626' :
    '#e5e7eb'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PreviewText = styled.span`
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.1s linear;
`;

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioUrl,
  onConfirm,
  onCancel,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <Container>
      <PreviewHeader>
        <ActionButtons>
          <IconButton onClick={togglePlayback}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </IconButton>
          <PreviewText>{__('Preview recording')}</PreviewText>
        </ActionButtons>

        <ActionButtons>
          <Tip text={__('Cancel')}>
            <IconButton onClick={onCancel}>
              <X size={20} />
            </IconButton>
          </Tip>
          <Tip text={__('Send audio message')}>
            <IconButton onClick={onConfirm} $variant="primary">
              <Send size={20} />
            </IconButton>
          </Tip>
        </ActionButtons>
      </PreviewHeader>

      <ProgressContainer>
        <ProgressBar $progress={progress} />
      </ProgressContainer>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        style={{ display: 'none' }}
      />
    </Container>
  );
};
