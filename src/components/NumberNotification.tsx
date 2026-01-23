import React, { useEffect } from 'react'
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { useTheme } from '../context/ThemeContext';

export const NumberNotification = ({pressed=()=>{}}:any) => {
  const { colors: themeColors } = useTheme();
  const bounceAnim = new Animated.Value(1);
  const notifications = useAppSelector(state => state.datanotifications);
  
  useEffect(() => {
    startBounceLoop();
  }, [notifications]);
  
  const startBounceLoop = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const countNot = notifications.filter((noti) => noti.est_not !== 'Leida').length;
  
  return (
    <Animated.View style={[styles.badge, { transform: [{ scale: bounceAnim }] }]}>
      <Pressable onPress={pressed}>
        <Text style={styles.badgeText}>{countNot}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
})