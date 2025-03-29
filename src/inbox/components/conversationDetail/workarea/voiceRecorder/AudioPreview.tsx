import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import type { AudioPreviewProps } from './types';
import Icon from '@octobots/ui/src/components/Icon';
import { ControlButton } from './AudioControls';
import Tip from '@octobots/ui/src/components/Tip';
import { __ } from 'coreui/utils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewText = styled.span`
  font-size: 0.875rem;
  color: #4b5563;
`;

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioUrl,
  onConfirm,
  onCancel,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <Container>
        <ActionButtons>
          <ControlButton $color="#3ccc38" onClick={togglePlayback}>
            {isPlaying ? <Icon icon="pause-1" color='white' size={24} /> : <Icon icon="play-1" color='white' size={24} />}
          </ControlButton>
          <PreviewText>{__('Preview recording')}</PreviewText>
        </ActionButtons>

        <ActionButtons>
          <Tip text={__('Cancel')}>
            <ControlButton onClick={onCancel}>
              <Icon icon="times" size={24} />
            </ControlButton>
          </Tip>
          <Tip text={__('Send audio message')}>
            <ControlButton $color="#3ccc38" onClick={onConfirm}>
              <Icon icon="send" color='white' size={24} />
            </ControlButton>
          </Tip>
        </ActionButtons>

      </Container>
      <audio
        controls
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
      />
    </>

  );
};