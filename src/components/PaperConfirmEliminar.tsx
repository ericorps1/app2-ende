import * as React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PropsPaperConfirmEliminar {
    visible: boolean;
    title: string;
    text: string;
    evDismiss: () => void;
    pressDelete: () => void;
    btnDisabled: boolean;
}

export const PaperConfirmEliminar = ({
    visible,
    title,
    text,
    evDismiss,
    pressDelete,
    btnDisabled
}: PropsPaperConfirmEliminar) => {
    const { theme, colors: themeColors } = useTheme();
    const colorScheme = useColorScheme();
    
    // 🌙 Detectar dark mode
    const isDarkMode = theme === 'dark' || colorScheme === 'dark';

    return (
        <Portal>
            <Dialog 
                visible={visible} 
                onDismiss={evDismiss} 
                style={[styles.dialog, { backgroundColor: themeColors.backgroundCard }]}
            >
                {/* ÍCONO DE ALERTA */}
                <View style={styles.iconContainer}>
                    <Icon name="alert-circle-outline" size={48} color="#FF3B30" />
                </View>

                {/* TÍTULO */}
                <Dialog.Title style={[styles.title, { color: themeColors.textPrimary }]}>
                    {title}
                </Dialog.Title>
                
                {/* CONTENIDO */}
                <Dialog.Content>
                    <Text style={[styles.text, { color: themeColors.textSecondary }]}>
                        {text}
                    </Text>
                </Dialog.Content>

                {/* ACCIONES */}
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[
                            styles.cancelButton, 
                            { backgroundColor: themeColors.backgroundGray },
                            btnDisabled && styles.buttonDisabled
                        ]}
                        onPress={evDismiss}
                        disabled={btnDisabled}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.cancelButtonText, { color: themeColors.textPrimary }]}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.deleteButton, 
                            { backgroundColor: themeColors.textPrimary },
                            btnDisabled && styles.buttonDisabled
                        ]}
                        onPress={pressDelete}
                        disabled={btnDisabled}
                        activeOpacity={0.7}
                    >
                        {btnDisabled ? (
                            <Text style={[styles.deleteButtonText, { color: themeColors.backgroundCard }]}>
                                Eliminando...
                            </Text>
                        ) : (
                            <>
                                <Icon name="delete-outline" size={18} color={themeColors.backgroundCard} />
                                <Text style={[styles.deleteButtonText, { color: themeColors.backgroundCard }]}>
                                    Eliminar
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 16,
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
    },
    text: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        paddingTop: 20,
    },
    cancelButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});