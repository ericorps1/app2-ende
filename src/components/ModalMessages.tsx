import React from 'react'
import { StyleSheet, Text, View, Modal, TouchableOpacity, useColorScheme } from 'react-native';
import { TypesMsgModalType } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface Props{
    visible: boolean;
    typeMsgModal: TypesMsgModalType;
    modalText: string;
    onDismiss: () => void;
}

export const ModalMessages = ({ visible, typeMsgModal, modalText, onDismiss}: Props) => {
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
  
  // 🌙 Detectar dark mode
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';
  
  const getIconAndColor = () => {
    switch(typeMsgModal) {
      case 'success':
        return { icon: 'check-circle', color: '#34C759', title: 'Éxito' };
      case 'error':
        return { icon: 'alert-circle', color: '#FF3B30', title: 'Error' };
      case 'danger':
        return { icon: 'alert', color: '#FF9500', title: 'Advertencia' };
      case 'info':
        return { icon: 'information', color: '#1976D2', title: 'Información' };
      default:
        return { icon: 'information', color: '#1976D2', title: 'Información' };
    }
  };

  const config = getIconAndColor();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}>
          {/* ÍCONO */}
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Icon name={config.icon} size={48} color={config.color} />
          </View>

          {/* TÍTULO */}
          <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>

          {/* MENSAJE */}
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>
            {modalText}
          </Text>

          {/* BOTÓN */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.textPrimary }]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: themeColors.backgroundCard }]}>
              Aceptar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});