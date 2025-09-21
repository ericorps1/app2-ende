import React from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { Touchable } from '../components/Touchable';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/platformTheme';

interface PropsVideoConferenciaBtn {
  onPressVideoConference: () => void;
}

export const VideoConferenciaBtn = ({ onPressVideoConference }: PropsVideoConferenciaBtn) => {
  return (
    <View style={styles.premiumFloat}>
      <Touchable
        onPress={onPressVideoConference}
        styleContainer={styles.premiumButton}
      >
        <View style={styles.gradientBackground}>
          <View style={styles.iconWrapper}>
            <Icon name="videocam-outline" size={26} color="#fff" />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.mainText}>Video</Text>
            <Text style={styles.subText}>Conferencia</Text>
          </View>
        </View>
        <View style={styles.glowEffect} />
      </Touchable>
    </View>
  );
};

const styles = StyleSheet.create({
  premiumFloat: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 1000,
  },
  
  premiumButton: {
    position: 'relative',
  },
  
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  
  textSection: {
    alignItems: 'flex-start',
  },
  
  mainText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 15,
  },
  
  subText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  
  glowEffect: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.6,
  },
});

export default VideoConferenciaBtn;