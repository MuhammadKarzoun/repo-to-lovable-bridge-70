export interface AudioRecorderProps {
    onSend: (response: any) => void;
    onCancel: () => void;
    maxDuration?: number; // in seconds
  }
  
  export interface WaveformProps {
    analyser: AnalyserNode | null;
    isRecording: boolean;
    isPaused: boolean;
  }
  
  export interface AudioControlsProps {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onPauseRecording: () => void;
    onResumeRecording: () => void;
    onCancel: () => void;
  }
  
  export interface RecordingTimerProps {
    duration: number;
    maxDuration: number;
  }
  
  export interface AudioPreviewProps {
    audioUrl: string;
    onConfirm: () => void;
    onCancel: () => void;
  }