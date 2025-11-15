import * as React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  colorTitle = '#000',
  colorBody = '#666',
  onDismiss = () => {},
  pressButton = () => {},
  btnTxtCancel = '',
  evtBtnCancel = () => {},
  loading = false
}: PropsPaperMessages) => {
  
  const getIconByType = () => {
    if (title.toLowerCase().includes('error')) return { name: 'alert-circle', color: '#FF3B30' };
    if (title.toLowerCase().includes('éxito') || title.toLowerCase().includes('exito')) return { name: 'check-circle', color: '#34C759' };
    if (title.toLowerCase().includes('confirmar')) return { name: 'help-circle', color: '#FF9500' };
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ICON */}
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Icon name={icon.name} size={48} color={icon.color} />
          </View>

          {/* TITLE */}
          <Text style={[styles.title, { color: colorTitle }]}>{title}</Text>

          {/* MESSAGE */}
          <Text style={[styles.message, { color: colorBody }]}>{message}</Text>

          {/* BUTTONS */}
          <View style={styles.buttonsContainer}>
            {btnTxtCancel !== '' && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={evtBtnCancel}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <Text style={styles.buttonSecondaryText}>{btnTxtCancel}</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                btnTxtCancel === '' && styles.buttonFull
              ]}
              onPress={pressButton}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonPrimaryText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#000',
  },
  buttonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
});

export default PaperMessages;