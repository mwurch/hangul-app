import { useCallback, useEffect, useRef, useState } from 'react';
import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import { AUDIO_REGISTRY } from '../data/audioRegistry';

interface UseAudioResult {
  readonly playSound: (audioFile: string) => void;
  readonly isPlaying: boolean;
}

export function useAudio(): UseAudioResult {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      playerRef.current?.remove();
    };
  }, []);

  const playSound = useCallback((audioFile: string): void => {
    const source = AUDIO_REGISTRY[audioFile];
    if (source === undefined) {
      return;
    }

    playerRef.current?.remove();

    const player = createAudioPlayer(source);
    playerRef.current = player;

    player.addListener('playbackStatusUpdate', (status) => {
      if (status.playing) {
        setIsPlaying(true);
      } else if (status.currentTime >= status.duration && status.duration > 0) {
        setIsPlaying(false);
        player.remove();
        if (playerRef.current === player) {
          playerRef.current = null;
        }
      }
    });

    setIsPlaying(true);
    player.play();
  }, []);

  return { playSound, isPlaying };
}
