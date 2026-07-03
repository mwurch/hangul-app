import { renderHook, act } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import { useAudio } from '../useAudio';

// Mock expo-audio
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
}));

jest.mock('../../data/audioRegistry', () => ({
  AUDIO_REGISTRY: {
    'giyeok.mp3': 1, // Metro require() returns a number for bundled assets
    'nieun.mp3': 2,
  },
}));

const mockCreateAudioPlayer = createAudioPlayer as jest.Mock;

describe('useAudio', () => {
  let mockPlayer: {
    play: jest.Mock;
    remove: jest.Mock;
    addListener: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayer = {
      play: jest.fn(),
      remove: jest.fn(),
      addListener: jest.fn(),
    };
    mockCreateAudioPlayer.mockReturnValue(mockPlayer);
  });

  it('starts with isPlaying false', () => {
    // Arrange & Act
    const { result } = renderHook(() => useAudio());

    // Assert
    expect(result.current.isPlaying).toBe(false);
  });

  it('plays a registered audio file', () => {
    // Arrange
    const { result } = renderHook(() => useAudio());

    // Act
    act(() => {
      result.current.playSound('giyeok.mp3');
    });

    // Assert
    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(1);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(true);
  });

  it('does nothing for an unregistered audio file', () => {
    // Arrange
    const { result } = renderHook(() => useAudio());

    // Act
    act(() => {
      result.current.playSound('nonexistent.mp3');
    });

    // Assert
    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it('removes previous player before playing a new one', () => {
    // Arrange
    const { result } = renderHook(() => useAudio());

    // Act — play first sound
    act(() => {
      result.current.playSound('giyeok.mp3');
    });

    const firstPlayer = mockPlayer;
    // Create a new mock for the second player
    mockPlayer = {
      play: jest.fn(),
      remove: jest.fn(),
      addListener: jest.fn(),
    };
    mockCreateAudioPlayer.mockReturnValue(mockPlayer);

    // Act — play second sound (should remove first)
    act(() => {
      result.current.playSound('nieun.mp3');
    });

    // Assert
    expect(firstPlayer.remove).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('sets isPlaying to false when playback finishes', () => {
    // Arrange
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playSound('giyeok.mp3');
    });
    expect(result.current.isPlaying).toBe(true);

    // Act — simulate playback completion via status listener
    const statusCallback = mockPlayer.addListener.mock.calls[0][1];
    act(() => {
      statusCallback({ playing: false, currentTime: 1.5, duration: 1.5 });
    });

    // Assert
    expect(result.current.isPlaying).toBe(false);
  });

  it('does not set isPlaying false for mid-playback status updates', () => {
    // Arrange
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playSound('giyeok.mp3');
    });

    // Act — simulate mid-playback update
    const statusCallback = mockPlayer.addListener.mock.calls[0][1];
    act(() => {
      statusCallback({ playing: true, currentTime: 0.5, duration: 1.5 });
    });

    // Assert
    expect(result.current.isPlaying).toBe(true);
  });
});
