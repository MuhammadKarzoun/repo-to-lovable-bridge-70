import React from 'react';
import styled from 'styled-components';
import type { AudioControlsProps } from './types';
import { Mic, Square, X } from 'lucide-react';
import Tip from '@octobots/ui/src/components/Tip';
import { __ } from 'coreui/utils';

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
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
    background-color: ${props => 
      props.$variant === 'primary' ? '#2563eb' :
      props.$variant === 'danger' ? '#dc2626' :
      '#f9fafb'};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AudioControls: React.FC<AudioControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onCancel,
}) => {
  return (
    <ControlsContainer>
      {!isRecording ? (
        <Tip text={__('Start recording')}>
          <IconButton onClick={onStartRecording} $variant="primary">
            <Mic size={20} />
          </IconButton>
        </Tip>
      ) : (
        <>
          <Tip text={__('Cancel')}>
            <IconButton onClick={onCancel}>
              <X size={20} />
            </IconButton>
          </Tip>
          <Tip text={__('Stop recording')}>
            <IconButton onClick={onStopRecording} $variant="danger">
              <Square size={20} />
            </IconButton>
          </Tip>
        </>
      )}
    </ControlsContainer>
  );
};
