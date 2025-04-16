import React from 'react'
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/platformTheme';

interface Props {
    children: JSX.Element | JSX.Element[],
    primaryColor: string,
    secondaryColor: string,
}

export const GradientBackground = ({ children, primaryColor, secondaryColor }: Props) => {
  return (
    <View style={{ flex: 1 }}>
        <LinearGradient
            colors={[primaryColor, secondaryColor, '#D9D9D9', colors.softSilver]}
            style={{ ...StyleSheet.absoluteFillObject, opacity: 0.8 }}
            // start={{ x: 0.3, y: 0.1 }}
            // end={{ x:0.5, y:1 }}
        ></LinearGradient>
        { children }
    </View>
  )
}
