import React from 'react';
import { GestureResponderEvent, View, ViewStyle } from 'react-native';

interface TouchableButtonProps {
  style?: ViewStyle | ViewStyle[];
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function TouchableButton({ style, onPress, children, disabled }: TouchableButtonProps) {
  return (
    <View 
      style={[style, disabled && { opacity: 0.5 }]} 
      onTouchEnd={disabled ? undefined : onPress}
    >
      {children}
    </View>
  );
}