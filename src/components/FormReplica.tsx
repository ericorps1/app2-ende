import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PropsFormReplica{
    loading: boolean;
    infoReplica: {
        id_com: number;
        nomCom: string;
    };
    guardarReplica: (id_com:number,replica:string) => void;
    msgError: string;
}

export const FormReplica = ({loading, infoReplica, guardarReplica, msgError}: PropsFormReplica) => {
    const { theme, colors: themeColors } = useTheme();
    const colorScheme = useColorScheme();
    const [miReplica, setMiReplica] = useState(infoReplica.nomCom+':\n')
    
    // 🌙 Detectar dark mode
    const isDarkMode = theme === 'dark' || colorScheme === 'dark';
    
    return (
        <View style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: themeColors.backgroundGray }]}>
                    <Icon name="reply" size={20} color={themeColors.textSecondary} />
                </View>
                <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
                    Responder a {infoReplica.nomCom}
                </Text>
            </View>

            {/* ERROR MESSAGE */}
            {msgError !== '' && (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={16} color="#FF3B30" />
                    <Text style={styles.errorText}>{msgError}</Text>
                </View>
            )}

            {/* INPUT */}
            <TextInput
                value={miReplica}
                multiline
                numberOfLines={6}
                editable
                onChangeText={text => setMiReplica(text)}
                style={[styles.input, { 
                    backgroundColor: themeColors.backgroundGray,
                    color: themeColors.textPrimary,
                    borderColor: themeColors.borderGray
                }]}
                placeholder={'Escribe tu réplica aquí...'}
                placeholderTextColor={themeColors.textTertiary}
            />

            {/* ACTIONS */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[
                        styles.submitButton, 
                        { backgroundColor: themeColors.textPrimary },
                        loading && styles.submitButtonDisabled
                    ]}
                    onPress={() => guardarReplica(infoReplica.id_com, miReplica)}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Icon name="send" size={16} color={themeColors.backgroundCard} style={styles.submitIcon} />
                    <Text style={[styles.submitButtonText, { color: themeColors.backgroundCard }]}>
                        {loading ? 'Enviando...' : 'Publicar réplica'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B3015',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        gap: 8,
    },
    errorText: {
        fontSize: 13,
        color: '#FF3B30',
        fontWeight: '600',
        flex: 1,
    },
    input: {
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        textAlignVertical: 'top',
        minHeight: 120,
        marginBottom: 16,
        borderWidth: 1,
    },
    actions: {
        alignItems: 'stretch',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});