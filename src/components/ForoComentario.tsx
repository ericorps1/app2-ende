import React, { useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FotoPerfil } from './FotoPerfil';
import { ForoComentarioReplica } from './ForoComentarioReplica';
import { formatDateComentarios } from '../hooks/useFormats';
import { PropsForoComentario, ReplicasForo } from '../interfaces/appInterfaces';
import { AuthContext } from '../context/AuthContext';

export const ForoComentario = ({ 
  id_com, 
  nombre, 
  comentario, 
  foto, 
  fecha, 
  replicas, 
  onPressResp, 
  eliminar, 
  eliminarComentario = () => false, 
  funcEliminarReplica = () => false 
}: PropsForoComentario) => {
  const { data_alumno } = useContext(AuthContext);
  
  return (
    <View style={styles.container}>
      {/* HEADER DEL COMENTARIO */}
      <View style={styles.header}>
        <FotoPerfil 
          foto={foto ?? ''} 
          nom_alu={nombre} 
          style={styles.avatar} 
          size={40}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{nombre}</Text>
          <Text style={styles.date}>{fecha}</Text>
        </View>
        
        {/* ACCIONES */}
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => onPressResp({id_com: id_com, nomCom: nombre})}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Icon name="reply" size={20} color="#666" />
          </TouchableOpacity>
          
          {eliminar && (
            <TouchableOpacity 
              onPress={eliminarComentario}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Icon name="delete-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENIDO DEL COMENTARIO */}
      <View style={styles.content}>
        <Text style={styles.commentText}>{comentario}</Text>
      </View>

      {/* RÉPLICAS */}
      {replicas.length > 0 && (
        <View style={styles.repliesContainer}>
          <View style={styles.repliesHeader}>
            <Icon name="reply-all" size={14} color="#999" />
            <Text style={styles.repliesCount}>
              {replicas.length} {replicas.length === 1 ? 'réplica' : 'réplicas'}
            </Text>
          </View>
          
          {replicas.map(({id_rep, id_com, id_alu, nom_alu, app_alu, apm_alu, rep_rep, fot_alu, fec_rep}: ReplicasForo) => {
            const elimRep = data_alumno?.id_alu === id_alu;
            return (
              <ForoComentarioReplica 
                key={id_rep}
                id_rep={id_rep}
                id_com={id_com}
                nombre={nom_alu + ' ' + app_alu + ' ' + apm_alu}
                replica={rep_rep}
                foto={fot_alu}
                fecha={formatDateComentarios(fec_rep.replace(' ', 'T'))}
                onPressRespReplica={onPressResp}
                eliminarReplica={elimRep}
                eliminarReplicaF={funcEliminarReplica}
              />
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingLeft: 50,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 50,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  repliesCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
});