
import React, { useState, useRef, useEffect } from 'react';
import type { AudioRecorderProps } from './types';
import { Waveform } from './Waveform';
import { AudioControls } from './AudioControls';
import { RecordingTimer } from './RecordingTimer';
import { AudioPreview } from './AudioPreview';
import Alert from '@octobots/ui/src/utils/Alert';
import uploadHandler from '@octobots/ui/src/utils/uploadHandler';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceRecorder: React.FC<AudioRecorderProps> = ({
  onSend,
  onCancel,
  maxDuration = 300
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const analyser = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerInterval = useRef<number>();

  useEffect(() => {
    return () => {
      clearInterval(timerInterval.current);
      URL.revokeObjectURL(audioUrl || '');
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      chunksRef.current = [];

      // Step 1: Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Step 2: Setup analyser
      const audioContext = new AudioContext();
      analyser.current = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser.current);

      // Step 3: Create recorder
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start();
      setIsRecording(true);

      // Step 4: Timer
      timerInterval.current = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    clearInterval(timerInterval.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
  };

  const handleConfirm = () => {
    if (!audioUrl) return;

    fetch(audioUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });

        uploadHandler({
          files: {
            length: 1,
            item: () => file,
            0: file,
            [Symbol.iterator]: function* () {
              yield file;
            },
          },
          beforeUpload: () => {},
          afterUpload: ({ status, response }) => {
            if (status === 'ok') {
              onSend({
                url: response,
                name: file.name,
                type: file.type,
                size: file.size,
                duration: null // Optional: can add duration using decodeAudioData
              });
            } else {
              Alert.error('Upload failed');
            }
          }
        });

        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      });
  };

  const handleCancel = () => {
    stopRecording();
    setAudioUrl(null);
    onCancel();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-3 w-full bg-white rounded-lg p-4 shadow-lg border border-gray-100"
    >
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 bg-red-50 p-2 rounded-md"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!isRecording && !audioUrl && (
          <motion.button
            key="close-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={handleCancel}
            className="absolute top-2 right-2 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </motion.button>
        )}

        {isRecording && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <Waveform
              isRecording={isRecording}
              isPaused={isPaused}
              analyser={analyser.current}
            />
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <RecordingTimer duration={duration} maxDuration={maxDuration} />
              <AudioControls
                isRecording={isRecording}
                isPaused={isPaused}
                duration={duration}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onPauseRecording={() => {}}
                onResumeRecording={() => {}}
                onCancel={handleCancel}
              />
            </div>
          </motion.div>
        )}

        {!isRecording && !audioUrl && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
          >
            <span className="text-gray-500 font-medium">Click the microphone to start recording</span>
            <AudioControls
              isRecording={isRecording}
              isPaused={isPaused}
              duration={duration}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onPauseRecording={() => {}}
              onResumeRecording={() => {}}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        {!isRecording && audioUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <AudioPreview
              audioUrl={audioUrl}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
