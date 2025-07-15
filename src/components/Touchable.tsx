import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { StyleProp, ViewStyle } from 'react-native';

interface TouchableProps {
  children: React.ReactNode;
  onPress: () => void;
  styleContainer: object;
}

export const Touchable: React.FC<TouchableProps> = ({children, onPress, styleContainer}) => {
  return (
    <Pressable
      onPress={onPress}
    >
      {({ pressed }) => (
        <View style={{ ...styleContainer, opacity: pressed ? 0.8 : 1 }}>
          {children}
        </View>
      )}
    </Pressable>
  )
}
