import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl, useColorScheme, SafeAreaView } from 'react-native';
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
import { useTheme } from '../context/ThemeContext';
import { BackButtonNavigation } from '../components/BackButtonNavigation';

export const Foro = ({route,navigation}:PropsActividad) => {
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
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
  
  // 🌙 Detectar dark mode
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';

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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* HEADER */}
      <BackButtonNavigation title={titulo} subtitle='Foro de discusión' onPressBack={() => navigation.pop()} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.textPrimary}
            colors={[themeColors.textPrimary]}
          />
        }
      >
        {/* PREGUNTA DEL FORO */}
        <View style={[styles.questionCard, { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: themeColors.borderGray
        }]}>
          <View style={styles.questionHeader}>
            <View style={[styles.questionIconContainer, { backgroundColor: themeColors.backgroundGray }]}>
              <Icon name="forum" size={20} color={themeColors.textSecondary} />
            </View>
            <Text style={[styles.questionTitle, { color: themeColors.textPrimary }]}>
              Pregunta del foro
            </Text>
          </View>
          <View style={styles.questionContent}>
            <HtmlToJsx strHtml={descripcion} />
          </View>
        </View>

        {/* MI COMENTARIO */}
        <View style={[styles.myCommentCard, { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: themeColors.borderGray
        }]}>
          <View style={styles.myCommentHeader}>
            <Icon name="pencil" size={18} color={themeColors.textSecondary} />
            <Text style={[styles.myCommentTitle, { color: themeColors.textPrimary }]}>
              Tu comentario
            </Text>
          </View>
          <TextInput
            value={miComentario}
            multiline
            numberOfLines={5}
            editable
            onChangeText={text => setMiComentario(text)}
            style={[styles.commentInput, {
              backgroundColor: themeColors.backgroundGray,
              color: themeColors.textPrimary,
              borderColor: themeColors.borderGray
            }]}
            placeholder='Escribe tu comentario aquí (mínimo 15 caracteres)...'
            placeholderTextColor={themeColors.textTertiary}
          />
          <TouchableOpacity
            style={[
              styles.submitButton, 
              { backgroundColor: themeColors.textPrimary },
              loading && styles.submitButtonDisabled
            ]}
            onPress={guardarComentario}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Icon name="send" size={16} color={themeColors.backgroundCard} style={styles.submitIcon} />
            <Text style={[styles.submitButtonText, { color: themeColors.backgroundCard }]}>
              {loading ? 'Enviando...' : 'Publicar comentario'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* COMENTARIOS */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Icon name="comment-multiple" size={18} color={themeColors.textPrimary} />
            <Text style={[styles.commentsSectionTitle, { color: themeColors.textPrimary }]}>
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
            <View style={[styles.emptyState, { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: themeColors.borderGray
            }]}>
              <Icon name="comment-outline" size={48} color={themeColors.borderGray} />
              <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
                Aún no hay comentarios
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: themeColors.textTertiary }]}>
                Sé el primero en comentar
              </Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  questionContent: {
    paddingLeft: 4,
  },
  myCommentCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  myCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  myCommentTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  commentInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
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
    marginLeft: 8,
  },
  emptyState: {
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
});