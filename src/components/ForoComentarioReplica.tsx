import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FotoPerfil } from './FotoPerfil';

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
  return (
    <View style={styles.container}>
      {/* HEADER DE LA RÉPLICA */}
      <View style={styles.header}>
        <FotoPerfil 
          foto={foto ?? undefined} 
          nom_alu={nombre} 
          style={styles.avatar} 
          size={32}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{nombre}</Text>
          <Text style={styles.date}>{fecha}</Text>
        </View>
        
        {/* ACCIONES */}
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => onPressRespReplica({id_com, nomCom: nombre})}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Icon name="reply" size={16} color="#666" />
          </TouchableOpacity>
          
          {eliminarReplica && (
            <TouchableOpacity 
              onPress={() => eliminarReplicaF(id_rep)}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Icon name="delete-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENIDO DE LA RÉPLICA */}
      <View style={styles.content}>
        <Text style={styles.replyText}>{replica}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
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
    color: '#000',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#999',
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
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingLeft: 40,
  },
  replyText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});