
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { WaveformProps } from './types';

const Canvas = styled.canvas`
  width: 100%;
  height: 50px;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #e5e7eb, #f3f4f6);
`;

const WaveformContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%);
    pointer-events: none;
  }
`;

export const Waveform: React.FC<WaveformProps> = ({ analyser, isRecording, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isRecording || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx) return;

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#3b82f6');  // Blue-500
      gradient.addColorStop(1, '#60a5fa');  // Blue-400

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Calculate height and y-position for mirrored effect
        const height = Math.max(barHeight, 4);
        const y = (canvas.height - height) / 2;

        // Draw bar with rounded corners
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 1, height, 2);
        ctx.fill();

        x += barWidth;
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, isRecording, isPaused]);

  return (
    <WaveformContainer>
      <Canvas
        ref={canvasRef}
        width={300}
        height={50}
      />
    </WaveformContainer>
  );
};
