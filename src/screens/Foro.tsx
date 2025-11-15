import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { ActividadData, Comentarios, ReplicasForo, PropsActividad } from '../interfaces/appInterfaces';
import { colors } from '../theme/platformTheme';
import { ForoComentario } from '../components/ForoComentario';
import cafeApi from '../api/estudianteAPI';
import { formatDateComentarios } from '../hooks/useFormats';
import { AuthContext } from '../context/AuthContext';
import PaperMessages from '../components/PaperMessages';
import { Modal } from 'react-native-paper';
import { FormReplica } from '../components/FormReplica';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PaperConfirmEliminar } from '../components/PaperConfirmEliminar';

export const Foro = ({route,navigation}:PropsActividad) => {
  const { data_alumno } = useContext( AuthContext );
  const {identificador,titulo,descripcion,identificador_copia} = route.params.data_actividad;
  const [comentarios, setComentarios] = useState([])
  const [replicas, setReplicas] = useState<ReplicasForo|any>([])
  const [miComentario, setMiComentario] = useState('')
  const [message, setMessage] = useState('')
  const [titleMessage, setTitleMessage] = useState('Exito')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [idComElim, setIdComElim] = useState(0)
  const [idRepElim, setIdRepElim] = useState(0)
  const initialDataRep = {id_com: 0, nomCom: ''};
  const [dataReplica, setDataReplica] = useState(initialDataRep)
  const [messageErrorReplica, setMessageErrorReplica] = useState('')

  useEffect(() => {
    getComentarios();
  }, [])

  const onRefresh = async () => {
    setRefreshing(true);
    await getComentarios();
    setRefreshing(false);
  };
  
  const getComentarios = async () => {
    const {data} = await cafeApi.get('foro_comentarios', {params: { id_for_cop: identificador_copia }});
    if(data.trans===true && data.data.comentarios){
      setComentarios(data.data.comentarios);
      if(data.data.replicas){
        setReplicas(data.data.replicas);
      }
    }else{
      setComentarios([]);
    }
  }

  const guardarComentario = async () => {
    if(miComentario.length<15){
      setTitleMessage('Error');
      setMessage('El comentario debe de contener al menos 15 caracteres.');
      return false;
    }
    const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
    setLoading(true);
    const {data} = await cafeApi.post('foro_comentarios',{com_com: miComentario,id_for_cop: identificador_copia, id_alu_ram: data_alumno?.id_alu_ram}, headers)
    if(data.trans===true){
      setTitleMessage('Exito');
      setMessage('Comentario registrado exitosamente.');
      getComentarios();
      setMiComentario('');
    }else{
      setTitleMessage('Error');
      setMessage('Error intentando registrar el comentario, por favor, vuelva a intentarlo.');
    }
    setLoading(false);
  }

  const confirmElimComentario = async(id_com:number) => {
    setLoading(true);
    const {data} = await cafeApi.delete('foro_comentarios/'+id_com);
    if(data.trans===true){
      setIdComElim(0);
      setTitleMessage('Exito');
      setMessage('Comentario eliminado exitosamente.');
      getComentarios();
    }else{
      setIdComElim(0);
      setTitleMessage('Error');
      setMessage('Error al intentar eliminar el comentario, por favor, vuelva a intentarlo.');
    }
    setLoading(false);
  }

  const pressResponse = (newOb:{id_com:number,nomCom:string}) => {
    setDataReplica(newOb);
  }

  const guardarReplica = async(id_com:number,replica:string) => {
    setMessageErrorReplica('');
    const rep = replica.replace(dataReplica.nomCom,'');
    if(rep.length<15){
      setMessageErrorReplica('La replica debe de contener al menos 15 caracteres.');
      return false;
    }
    const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
    setLoading(true);
    const {data} = await cafeApi.post('foro_comentarios/replica',{replica: replica,id_com, id_alu_ram: data_alumno?.id_alu_ram}, headers)
    if(data.trans===true){
      setTitleMessage('Exito');
      setMessage('Replica al comentario registrada exitosamente.');
      getComentarios();
      setDataReplica(initialDataRep);
    }else{
      setMessageErrorReplica('Error intentando registrar la replica, por favor, vuelva a intentarlo.');
    }
    setLoading(false);
  }

  const confirmElimReplica = async(id_rep:number) => {
    setLoading(true);
    const {data} = await cafeApi.delete('foro_comentarios/replica/'+id_rep);
    if(data.trans===true){
      setIdRepElim(0);
      setTitleMessage('Exito');
      setMessage('Replica eliminada exitosamente.');
      getComentarios();
    }else{
      setIdRepElim(0);
      setTitleMessage('Error');
      setMessage('Error al intentar eliminar la replica del comentario, por favor, vuelva a intentarlo.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.pop()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{titulo}</Text>
          <Text style={styles.headerSubtitle}>Foro de discusión</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={['#000']}
          />
        }
      >
        {/* PREGUNTA DEL FORO */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionIconContainer}>
              <Icon name="forum" size={20} color="#666" />
            </View>
            <Text style={styles.questionTitle}>Pregunta del foro</Text>
          </View>
          <View style={styles.questionContent}>
            <HtmlToJsx strHtml={descripcion} />
          </View>
        </View>

        {/* MI COMENTARIO */}
        <View style={styles.myCommentCard}>
          <View style={styles.myCommentHeader}>
            <Icon name="pencil" size={18} color="#666" />
            <Text style={styles.myCommentTitle}>Tu comentario</Text>
          </View>
          <TextInput
            value={miComentario}
            multiline
            numberOfLines={5}
            editable
            onChangeText={text => setMiComentario(text)}
            style={styles.commentInput}
            placeholder='Escribe tu comentario aquí (mínimo 15 caracteres)...'
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={guardarComentario}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Icon name="send" size={16} color="#FFF" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Enviando...' : 'Publicar comentario'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* COMENTARIOS */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Icon name="comment-multiple" size={18} color="#000" />
            <Text style={styles.commentsSectionTitle}>
              Comentarios ({comentarios.length})
            </Text>
          </View>

          {comentarios.length > 0 ? (
            comentarios.map(({id_com,nom_alu,app_alu,apm_alu,com_com,fot_alu,fec_com,id_alu}:Comentarios)=>{
              const elimCom = data_alumno?.id_alu===id_alu;
              return (
                <ForoComentario 
                  key={id_com}
                  id_com={id_com}
                  nombre={nom_alu+' '+app_alu+' '+apm_alu}
                  comentario={com_com}
                  foto={fot_alu}
                  fecha={formatDateComentarios(fec_com.replace(' ', 'T'))}
                  replicas={replicas.filter((ob:{id_com:number})=>ob.id_com===id_com)}
                  onPressResp={pressResponse}
                  eliminar={elimCom}
                  eliminarComentario={elimCom ? () => setIdComElim(id_com) : () => false}
                  funcEliminarReplica={setIdRepElim}
                />
              )
            })
          ) : (
            <View style={styles.emptyState}>
              <Icon name="comment-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyStateText}>Aún no hay comentarios</Text>
              <Text style={styles.emptyStateSubtext}>Sé el primero en comentar</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ChatAlumno/>

      {/* MODALS Y ALERTS */}
      <PaperMessages 
        visible={message==='' ? false : true}
        title={titleMessage}
        message={message}
        buttonText='Aceptar'
        dismissable={true}
        colorTitle={titleMessage==='Exito' ? colors.success : colors.error}
        colorBody={colors.darkSilver}
        onDismiss={()=>setMessage('')}
        pressButton={()=>setMessage('')}
      />
      
      <PaperConfirmEliminar
        visible={idComElim!==0}
        title='¿Eliminar comentario?'
        text={'¿Seguro que deseas eliminar el comentario con id '+idComElim+'?'}
        evDismiss={()=>setIdComElim(0)}
        pressDelete={() => confirmElimComentario(idComElim)}
        btnDisabled={loading}
      />
      
      <PaperConfirmEliminar
        visible={idRepElim!==0}
        title='¿Eliminar replica?'
        text={'¿Seguro que deseas eliminar la replica con id '+idRepElim+'?'}
        evDismiss={()=>setIdRepElim(0)}
        pressDelete={()=>confirmElimReplica(idRepElim)}
        btnDisabled={loading}
      />
      
      <Modal 
        visible={dataReplica.id_com!==0}
        onDismiss={()=>setDataReplica(initialDataRep)}
        children={
          <FormReplica
            loading={loading}
            guardarReplica={guardarReplica}
            infoReplica={dataReplica}
            msgError={messageErrorReplica}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  questionContent: {
    paddingLeft: 4,
  },
  myCommentCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  myCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  myCommentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  commentInput: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
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
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 4,
  },
});