import React from 'react';
import styled from 'styled-components';
import type { AudioControlsProps } from './types';
import Icon from '@octobots/ui/src/components/Icon';
import styledTS from "styled-components-ts";
import Tip from '@octobots/ui/src/components/Tip';
import { __ } from 'coreui/utils';

const Button = styled.button`
  padding: 0.25rem;
  border-radius: 9999px;
  transition: background-color 0.2s;
`;

export const ControlButton = styledTS<{ $color?: string }>(styled(Button))`
    box-sizing: border-box;
    flex-shrink: 0;
    width: 55px;
    height: 55px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: ${props =>
        props.$color ? props.$color : '#fff'};
    border: 4px solid #c5c5c5;
    outline: none;
    cursor: pointer;
    transition: border-color .3s, background-color .3s;

    i {
         padding-top: 10px;
    }

    &:hover {
        border: 4px solid #9f9f9f;
    }
`;

export const AudioControls: React.FC<AudioControlsProps> = ({
    isRecording,
    isPaused,
    onStartRecording,
    onStopRecording,
    onPauseRecording,
    onResumeRecording,
    onCancel,
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {!isRecording ? (
                <Tip text={__('Start recording')}>
                    <ControlButton onClick={onStartRecording}>
                        <Icon icon="microphone-2" size={24} />
                    </ControlButton>
                </Tip>
            ) : (
                <>
                    <Tip text={__('Cancel')}>
                        <ControlButton onClick={onCancel}>
                            <Icon icon="times" size={24} />
                        </ControlButton>
                    </Tip>
                    <Tip text={isPaused ? __('Resume') : __('Pause')}>
                        <ControlButton $color={isPaused ? "#3ccc38" : "orange"} onClick={isPaused ? onResumeRecording : onPauseRecording}>
                            {isPaused ? <Icon icon="play-1" color='white' size={24} /> : <Icon icon="pause-1" color='white' size={24} />}
                        </ControlButton>
                    </Tip>
                    <Tip text={__('Stop recording')}>
                        <ControlButton $color="#ff3030" onClick={onStopRecording}>
                            <Icon icon="square-shape" color='white' size={24} />
                        </ControlButton>
                    </Tip>
                </>
            )}
        </div>
    );
};