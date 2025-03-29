import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { WaveformProps } from './types';

const Canvas = styled.canvas`
  width: 300px;
  height: 48px;
  border-radius: 0.5rem;
  background-color: #e5e5e5;
`;

const Waveform: React.FC<WaveformProps> = ({ analyser, isRecording, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isRecording || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set a smaller fftSize for more distinct bars
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx) return;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#e5e5e5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Calculate y position to center the bar vertically
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = '#1F97FF';
        ctx.fillRect(x, y, barWidth - 1, barHeight);

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
    <Canvas
      ref={canvasRef}
      width={300}
      height={48}
    />
  );
};

export { Waveform };