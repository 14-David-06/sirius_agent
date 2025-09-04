import React from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioMessageProps {
  audioUrl: string;
  duration: number;
  isPlaying?: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const AudioMessage: React.FC<AudioMessageProps> = ({
  audioUrl,
  duration,
  isPlaying = false,
  onPlay,
  onPause
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-blue-600 text-white p-3 rounded-lg max-w-xs">
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        {isPlaying ? (
          <Pause size={16} className="text-white" />
        ) : (
          <Play size={16} className="text-white ml-0.5" />
        )}
      </button>
      
      <div className="flex-1">
        {/* Simulación de forma de onda - puedes usar una librería real más adelante */}
        <div className="flex items-center gap-0.5 h-6 mb-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-white/40 rounded-full"
              style={{
                height: `${Math.random() * 20 + 8}px`
              }}
            />
          ))}
        </div>
        
        <div className="text-xs opacity-80">
          {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
