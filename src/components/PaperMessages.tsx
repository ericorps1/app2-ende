import * as React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PropsPaperMessages {
    visible: boolean;
    title: string;
    message: any;
    buttonText: string;
    dismissable: boolean;
    styleButton?: any;
    colorTitle?: string;
    colorBody?: string;
    onDismiss?: () => void;
    pressButton?: () => void;
    btnTxtCancel?: string;
    styleBtnCancel?: any;
    evtBtnCancel?: () => void;
    loading?: boolean;
}

const PaperMessages = ({
  visible,
  title,
  message,
  buttonText,
  dismissable,
  colorTitle,
  colorBody,
  onDismiss = () => {},
  pressButton = () => {},
  btnTxtCancel = '',
  evtBtnCancel = () => {},
  loading = false
}: PropsPaperMessages) => {
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
  
  // 🌙 Detectar dark mode
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';
  
  // 🎨 Colores con fallback al tema
  const finalColorTitle = colorTitle || themeColors.textPrimary;
  const finalColorBody = colorBody || themeColors.textSecondary;
  
  const getIconByType = () => {
    if (title.toLowerCase().includes('error') || title.toLowerCase().includes('sin intentos')) {
      return { name: 'alert-circle', color: '#FF3B30' };
    }
    if (title.toLowerCase().includes('éxito') || title.toLowerCase().includes('exito') || title.toLowerCase().includes('completado')) {
      return { name: 'check-circle', color: '#34C759' };
    }
    if (title.toLowerCase().includes('confirmar') || title.toLowerCase().includes('iniciar') || title.toLowerCase().includes('finalizar')) {
      return { name: 'help-circle', color: '#FF9500' };
    }
    return { name: 'information', color: '#1976D2' };
  };

  const icon = getIconByType();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={dismissable && !loading ? onDismiss : undefined}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={dismissable && !loading ? onDismiss : undefined}
      >
        <TouchableOpacity 
          style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ICON */}
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Icon name={icon.name} size={48} color={icon.color} />
          </View>

          {/* TITLE */}
          <Text style={[styles.title, { color: finalColorTitle }]}>{title}</Text>

          {/* MESSAGE */}
          <Text style={[styles.message, { color: finalColorBody }]}>{message}</Text>

          {/* BUTTONS */}
          <View style={styles.buttonsContainer}>
            {btnTxtCancel !== '' && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { 
                  backgroundColor: themeColors.backgroundGray 
                }]}
                onPress={evtBtnCancel}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={themeColors.textSecondary} />
                ) : (
                  <Text style={[styles.buttonSecondaryText, { 
                    color: themeColors.textSecondary 
                  }]}>
                    {btnTxtCancel}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                { backgroundColor: themeColors.textPrimary },
                btnTxtCancel === '' && styles.buttonFull
              ]}
              onPress={pressButton}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={themeColors.backgroundCard} />
              ) : (
                <Text style={[styles.buttonPrimaryText, { 
                  color: themeColors.backgroundCard 
                }]}>
                  {buttonText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

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
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    // Color dinámico aplicado inline
  },
  buttonSecondary: {
    // Color dinámico aplicado inline
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PaperMessages;