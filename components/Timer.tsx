import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  autoStart?: boolean;
}

export function Timer({ 
  initialSeconds = 0, 
  onComplete, 
  onTimeUpdate,
  autoStart = false 
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // onTimeUpdate callback'ini güncel tut
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          if (onTimeUpdateRef.current) {
            onTimeUpdateRef.current(newSeconds);
          }
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
  };

  const reset = () => {
    setSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(seconds)}</Text>
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.button} onPress={start}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.buttonText}>Başlat</Text>
          </TouchableOpacity>
        ) : isPaused ? (
          <>
            <TouchableOpacity style={styles.button} onPress={resume}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Devam</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stop}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.buttonText}>Durdur</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={pause}>
              <Ionicons name="pause" size={24} color="#fff" />
              <Text style={styles.buttonText}>Duraklat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stop}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.buttonText}>Durdur</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={reset}>
          <Ionicons name="refresh" size={24} color="#fff" />
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#FF5252',
  },
  resetButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});





