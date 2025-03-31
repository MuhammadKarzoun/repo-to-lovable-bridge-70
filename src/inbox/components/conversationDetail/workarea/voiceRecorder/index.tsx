import React, { useState, useRef, useEffect } from 'react';
import type { AudioRecorderProps } from './types';
import { Waveform } from './Waveform';
import { AudioControls } from './AudioControls';
import { RecordingTimer } from './RecordingTimer';
import { AudioPreview } from './AudioPreview';
import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc';
import Alert from '@octobots/ui/src/utils/Alert';
import uploadHandler from '@octobots/ui/src/utils/uploadHandler';
import Icon from '@octobots/ui/src/components/Icon';
import { generateRandomString } from '@octobots/ui/src/utils';

export const VoiceRecorder: React.FC<AudioRecorderProps> = ({
  onSend,
  onCancel,
  maxDuration = 300, // 5 minutes in seconds
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorder = useRef<RecordRTC | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timerInterval = useRef<number>();

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
      if (recorder.current) {
        recorder.current.destroy();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream.current);
      source.connect(analyser.current);

      recorder.current = new RecordRTCPromisesHandler(stream.current, {
        type: 'audio',
        mimeType: 'audio/mpeg',
        numberOfAudioChannels: 1,
        desiredSampRate: 44100,
        bitrate: 128000,
        audioBitsPerSecond: 128000
      });

      await recorder.current.startRecording();
      setIsRecording(true);

      timerInterval.current = window.setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Microphone access denied');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = async () => {
    if (recorder.current && isRecording) {
      try {
        await recorder.current.stopRecording();
        const blob = await recorder.current.getBlob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
        if (stream.current) {
          stream.current.getTracks().forEach(track => track.stop());
        }

        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
      } catch (err) {
        setError('Failed to stop recording');
        console.error('Error stopping recording:', err);
      }
    }
  };

  const pauseRecording = () => {
    if (recorder.current && isRecording) {
      recorder.current.pauseRecording();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (recorder.current && isRecording) {
      recorder.current.resumeRecording();
      timerInterval.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setIsPaused(false);
    }
  };

  const handleCancel = () => {
    if (recorder.current) {
      recorder.current.stopRecording();
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    onCancel();
  };

  const handleConfirm = () => {
    if (audioUrl) {
      fetch(audioUrl)
        .then(response => response.blob())
        .then(blob => {
          const mp3File = new File([blob], `${generateRandomString(4)}_${Date.now()}.mp3`, {
            type: 'audio/mp3',
            lastModified: Date.now(),
          });
          uploadHandler({
            files: {
              length: 1,
              item: (index: number) => index === 0 ? mp3File : null,
              0: mp3File,
              [Symbol.iterator]: function* () {
                yield this[0];
              }
            },
            beforeUpload: () => { },
            afterUpload: ({ response, fileInfo, status }) => {
              onSend({ url: response, ...fileInfo });

              if (status === 'ok') {
                Alert.info('Looking good!');
              } else {
                Alert.error(response);
              }
            },

            afterRead: ({ result, fileInfo }) => { },
          });

          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        });
    }
  };

  if (error) {
    return (
      <div className="text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={handleCancel}
          onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
          style={{ position: 'absolute', top: '10px', insetInlineEnd: '10px' }}
        >
          <Icon icon="times" size={20} />
        </button>
      )}

      {isRecording && (
        <>
          <Waveform
            analyser={analyser.current}
            isRecording={isRecording}
            isPaused={isPaused}
          />

          <div className="flex items-center justify-between">
            <RecordingTimer duration={duration} maxDuration={maxDuration} />
            <AudioControls
              isRecording={isRecording}
              isPaused={isPaused}
              duration={duration}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onPauseRecording={pauseRecording}
              onResumeRecording={resumeRecording}
              onCancel={handleCancel}
            />
          </div>
        </>
      )}

      {!isRecording && !audioUrl && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Click the microphone to start recording</span>
          <AudioControls
            isRecording={isRecording}
            isPaused={isPaused}
            duration={duration}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onCancel={handleCancel}
          />
        </div>
      )}

      {!isRecording && audioUrl && (
        <AudioPreview
          audioUrl={audioUrl}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
