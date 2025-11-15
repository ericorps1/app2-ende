import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { formatDate } from '../hooks/useFormats';
import { colors } from '../theme/platformTheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PropsCardSalaPreview {
    id_sal: number;
    urlImg: string;
    styleImg: object;
    nombre: string;
    grupo: string;
    title: string;
    lastSms: string;
    lastFecMsg: string;
    onPressCardSala: (id_sal:number,des_sal:string) => void;
}

export const CardSalaPreview = ({id_sal,urlImg,styleImg,nombre,grupo,title,lastSms,lastFecMsg,onPressCardSala}:PropsCardSalaPreview) => {
    const fecLastMsg = lastFecMsg ? formatDate(lastFecMsg.split(' ')[0], '/') : null;
    const hasUnread = false; // TODO: Conectar con lógica real de no leídos
    
    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.container} 
            onPress={()=>onPressCardSala(id_sal,nombre)}
        >
            <View style={styles.avatarContainer}>
                <Image 
                    source={{ uri: urlImg}}
                    style={styleImg}
                />
                {hasUnread && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Text style={styles.nombre} numberOfLines={1}>{nombre}</Text>
                        {grupo && (
                            <View style={styles.groupBadge}>
                                <Icon name="account-group" size={10} color="#FFF" />
                            </View>
                        )}
                    </View>
                    {fecLastMsg && (
                        <Text style={styles.fecha}>{fecLastMsg}</Text>
                    )}
                </View>

                {lastSms !== '' && (
                    <Text style={styles.lastMessage} numberOfLines={2}>
                        {lastSms}
                    </Text>
                )}
            </View>

            <Icon name="chevron-right" size={20} color="#D0D0D0" style={styles.chevron} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 14,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF3B30',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    nombre: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    groupBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    fecha: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
        fontFamily: 'NotoColorEmoji',
    },
    chevron: {
        marginLeft: 8,
    },
});