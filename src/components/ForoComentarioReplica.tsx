import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FotoPerfil } from './FotoPerfil';
import { useTheme } from '../context/ThemeContext';

interface PropsForoComentarioReplica {
    id_com: number;
    id_rep: number;
    nombre: string;
    fecha: string;
    foto: null | string;
    replica: string;
    onPressRespReplica: (ob:{id_com:number,nomCom:string}) => void;
    eliminarReplica: boolean;
    eliminarReplicaF: (id_rep:number) => void;
}

export const ForoComentarioReplica = ({ 
  id_com, 
  id_rep, 
  nombre, 
  foto, 
  fecha, 
  replica, 
  onPressRespReplica, 
  eliminarReplica, 
  eliminarReplicaF 
}: PropsForoComentarioReplica) => {
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
  
  // 🌙 Detectar dark mode
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';

  return (
    <View style={[styles.container, { 
      backgroundColor: themeColors.backgroundGray,
      borderLeftColor: themeColors.borderGray
    }]}>
      {/* HEADER DE LA RÉPLICA */}
      <View style={styles.header}>
        <FotoPerfil 
          foto={foto ?? undefined} 
          nom_alu={nombre} 
          style={styles.avatar} 
          size={32}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
            {nombre}
          </Text>
          <Text style={[styles.date, { color: themeColors.textTertiary }]}>
            {fecha}
          </Text>
        </View>
        
        {/* ACCIONES */}
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => onPressRespReplica({id_com, nomCom: nombre})}
            style={[styles.actionButton, { backgroundColor: themeColors.backgroundCard }]}
            activeOpacity={0.7}
          >
            <Icon name="reply" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
          
          {eliminarReplica && (
            <TouchableOpacity 
              onPress={() => eliminarReplicaF(id_rep)}
              style={[styles.actionButton, { backgroundColor: themeColors.backgroundCard }]}
              activeOpacity={0.7}
            >
              <Icon name="delete-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENIDO DE LA RÉPLICA */}
      <View style={styles.content}>
        <Text style={[styles.replyText, { color: themeColors.textSecondary }]}>
          {replica}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingLeft: 40,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});