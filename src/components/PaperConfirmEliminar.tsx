import * as React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={evDismiss} style={styles.dialog}>
                {/* ÍCONO DE ALERTA */}
                <View style={styles.iconContainer}>
                    <Icon name="alert-circle-outline" size={48} color="#FF3B30" />
                </View>

                {/* TÍTULO */}
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                
                {/* CONTENIDO */}
                <Dialog.Content>
                    <Text style={styles.text}>{text}</Text>
                </Dialog.Content>

                {/* ACCIONES */}
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.cancelButton, btnDisabled && styles.buttonDisabled]}
                        onPress={evDismiss}
                        disabled={btnDisabled}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.deleteButton, btnDisabled && styles.buttonDisabled]}
                        onPress={pressDelete}
                        disabled={btnDisabled}
                        activeOpacity={0.7}
                    >
                        {btnDisabled ? (
                            <Text style={styles.deleteButtonText}>Eliminando...</Text>
                        ) : (
                            <>
                                <Icon name="delete-outline" size={18} color="#FFF" />
                                <Text style={styles.deleteButtonText}>Eliminar</Text>
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
        backgroundColor: '#FFF',
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
        color: '#000',
    },
    text: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
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
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#000',
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
        color: '#FFF',
    },
});