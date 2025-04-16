import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, SafeAreaView, StyleSheet, useWindowDimensions, TextInput, Button, TouchableOpacity } from 'react-native';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { ActividadData, Comentarios, TypesMsgModalType, ReplicasForo, PropsActividad } from '../interfaces/appInterfaces';
import RenderHtml from 'react-native-render-html';
import { colors, platformTheme } from '../theme/platformTheme';
import { ForoComentario } from '../components/ForoComentario';
import cafeApi from '../api/estudianteAPI';
import { formatDateComentarios } from '../hooks/useFormats';
import { AuthContext } from '../context/AuthContext';
import PaperMessages from '../components/PaperMessages';
import { PaperConfirmElimComentario } from '../components/PaperConfirmElimComentario';
import { Modal } from 'react-native-paper';
import { FormReplica } from '../components/FormReplica';
import { PaperConfirmElimReplica } from '../components/PaperConfirmElimReplica';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';

export const Foro = ({route,navigation}:PropsActividad) => {
  const { data_alumno } = useContext( AuthContext );
  const {identificador,titulo,descripcion,identificador_copia} = route.params.data_actividad;
  const { width } = useWindowDimensions();
  const [comentarios, setComentarios] = useState([])
  const [replicas, setReplicas] = useState<ReplicasForo|any>([])
  const [miComentario, setMiComentario] = useState('')
  const [message, setMessage] = useState('')
  const [titleMessage, setTitleMessage] = useState('Exito')
  const [loading, setLoading] = useState(false)
  const [idComElim, setIdComElim] = useState(0)
  const [idRepElim, setIdRepElim] = useState(0)
  const initialDataRep = {id_com: 0, nomCom: ''};
  const [dataReplica, setDataReplica] = useState(initialDataRep)
  const [messageErrorReplica, setMessageErrorReplica] = useState('')

  useEffect(() => {
    getComentarios();
  }, [])
  
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
    <SafeAreaView style={ styles.container }>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={titulo}/>
      <ScrollView style={{marginBottom: 60}}>
        <View style={ styles.bodyBloDetalle }>
          <View style={ styles.foroPregunta }>
            <HtmlToJsx strHtml={descripcion}/>
          </View>
          <View style={ styles.containerMiComentario }>
            <Text style={ styles.titleMiComentario }>Mi Comentario:</Text>
            <TextInput
              value={miComentario}
              multiline
              numberOfLines={6}
              editable
              onChangeText={text => setMiComentario(text)}
              style={styles.inputMiComentario}
              placeholder='Realice una descripción breve a cerca de su comentario...'
            />
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                style={styles.buttonGuardarMiComentario}
                onPress={guardarComentario}
                disabled={loading}
              >
                <Text style={styles.textBtnGuardarMiComentario}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.foroRespuestas}>
            <Text style={ styles.title }>Comentarios: {comentarios.length}</Text>
            {
              comentarios.length>0 &&
                comentarios.map(({id_com,nom_alu,app_alu,apm_alu,com_com,fot_alu,fec_com,id_alu}:Comentarios)=>{
                  const elimCom = data_alumno?.id_alu===id_alu;
                  return (
                    <ForoComentario 
                      key={id_com}
                      id_com={id_com}
                      nombre={nom_alu+' '+app_alu+' '+apm_alu}
                      comentario={com_com}
                      foto={ fot_alu }
                      fecha={formatDateComentarios(fec_com.replace(' ', 'T'))}
                      replicas={replicas.filter((ob:{id_com:number})=>ob.id_com===id_com)}
                      onPressResp={pressResponse}
                      eliminar={elimCom}
                      eliminarComentario={elimCom ? () => setIdComElim(id_com) : () => false}
                      funcEliminarReplica={setIdRepElim}
                    />
                  )
                })
            }
          </View>
        </View>
      </ScrollView>
      <View style={{paddingLeft: 20}}>
        <ChatAlumno/>
      </View>
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
      <PaperConfirmElimComentario
        com_id={idComElim}
        visible={idComElim===0 ? false : true}
        title='¿Eliminar comentario?'
        text={'¿Seguro que deseas eliminar el comentario con id '+idComElim+'?'}
        evDismiss={()=>setIdComElim(0)}
        pressDelete={confirmElimComentario}
        btnDisabled={loading}
      />
      <PaperConfirmElimReplica
        rep_id={idRepElim}
        visible={idRepElim===0 ? false : true}
        title='¿Eliminar replica?'
        text={'¿Seguro que deseas eliminar la replica con id '+idRepElim+'?'}
        evDismiss={()=>setIdRepElim(0)}
        pressDelete={confirmElimReplica}
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
    paddingTop: 10,
    flex: 1,
    paddingLeft: 20,
  },
  bodyBloDetalle: { 
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  foroPregunta: {
    backgroundColor: colors.softSilver,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginRight: 20,
    borderRadius: 10
  },
  containerMiComentario: {
    backgroundColor: colors.softSilver,
    marginRight: 20,
    marginTop: 10,
    borderRadius: 10,
    paddingBottom: 20,
  },
  titleMiComentario: {
    color: colors.darkBlue,
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
  },
  inputMiComentario: {
    padding: 10,
    textAlignVertical: 'top',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    borderColor: colors.darkBlue,
  },
  buttonGuardarMiComentario: {
    ...platformTheme.btn,
    ...platformTheme.btnDarkBlue,
    padding: 10,
    borderRadius: 10,
  },
  textBtnGuardarMiComentario: {
    color: 'white',
    fontSize: 16,
  },
  foroRespuestas: {
    backgroundColor: colors.softBlue,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginRight: 20,
    borderRadius: 10,
    marginTop: 20
  },
  title: {
    fontSize: 25,
    color: colors.darkBlue,
    fontWeight: 'bold'
  }
})
