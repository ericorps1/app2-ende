import React, { useContext, useEffect, useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, useWindowDimensions, StyleSheet, Dimensions, Platform } from 'react-native';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { AuthContext } from '../context/AuthContext';
import { FilePick, PropsActividad, TypesMsgModalType } from '../interfaces/appInterfaces';
import DocumentPicker from 'react-native-document-picker';
import { colors, platformTheme } from '../theme/platformTheme';
import { nombreGuionesMinus } from '../hooks/useFormats';
import cafeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { Button } from 'react-native-paper';
import { useUploads } from '../hooks/useUploads';
import { ModalMessages } from '../components/ModalMessages';
import { baseUrlFiles } from '../hooks/useGlobal';
import { fnDownloadFile } from '../hooks/useDownloads';
import { PaperConfirmEliminar } from '../components/PaperConfirmEliminar';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';
import { requestCameraPermission } from '../hooks/usePermisions';

export const Entregable = ({route,navigation}:PropsActividad) => {
  const { token } = useContext(AuthContext);
  useEffect(() => {
    getEntregableAlu();
  }, [])
  const initialStateObFile = { fileCopyUri: null, name: "", size: 0, type: "", uri: "" };
  const { data_alumno } = useContext( AuthContext );
  const {identificador,titulo,descripcion,identificador_copia,nom_blo,nom_mat} = route.params.data_actividad;
  const [infoRespTarea, setInfoRespTarea] = useState<any>([]);
  const [obFile, setObFile] = useState<FilePick>(initialStateObFile);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [typeMsg, setTypeMsg] = useState<TypesMsgModalType>('success');
  const [titleEliminar, setTitleEliminar] = useState('');
  const [textEliminar, setTextEliminar] = useState('');
  //funcion para consultar si el alumno ya subio un entregable para esta actividad
  const getEntregableAlu = async () => {
    const {data} = await cafeApi.get('/tarea', {params: {id_ent_cop: identificador_copia, id_alu_ram: data_alumno?.id_alu_ram}});
    setLoading(true);
    if(data.trans){
      setInfoRespTarea(data.data);
    }else{
      setInfoRespTarea([]);
    }
    setLoading(false);
  }
  const { width } = useWindowDimensions();


  const handleError = (err: unknown) => {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker, exit any dialogs or menus and move on
    } else {
      throw err
    }
  }

  const loadFile = async () => {
    try {
      const file: any = await DocumentPicker.pickSingle({
        copyTo: 'cachesDirectory', // 🔥 CLAVE: Copiar a cache
      });
      
      // 🔥 Usar fileCopyUri en lugar de uri para Android
      const realUri = Platform.OS === 'android' 
        ? file.fileCopyUri || file.uri 
        : file.uri;
      
      setObFile({
        ...file,
        uri: realUri, // 🔥 Usar el URI copiado
      });
    } catch (error) {
      handleError(error);
    }
  }

  const getPhoto = async (type: 'photo' | 'img') => {
    let result: any = { assets: undefined };
    
    if (type === 'photo') {
      const permission = await requestCameraPermission();
      if (!permission) {
        setTypeMsg('error');
        setAlertMsg('No se ha concedido el permiso para usar la cámara.');
        return false;
      }
      result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        maxWidth: 500,
        maxHeight: 500,
        saveToPhotos: false, // 🔥 No guardar en galería
      });
    } else {
      result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 500,
        maxHeight: 500,
      });
    }
    
    if (result.assets) {
      const asset = result.assets[0];
      
      setObFile({
        name: asset.fileName || 'photo.jpg',
        uri: asset.uri, // 🔥 Este URI ya es válido desde la cámara/galería
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
        fileCopyUri: asset.uri,
      });
    }
  };
  const uploadFile = async () => {
    const arrFileName = obFile.name.split('.');
    const fileExt = arrFileName[arrFileName.length - 1];
    
    try {
      if (obFile.name === "") return false;
      
      if (!obFile.uri || obFile.uri === '') {
        setTypeMsg('error');
        setAlertMsg('No se pudo acceder al archivo. Por favor, selecciónalo nuevamente.');
        return false;
      }
      
      setLoading(true);
      
      const serverFileName = `${nombreGuionesMinus(
        data_alumno?.nom_gen + '-' + data_alumno?.nom_alu + '-' + nom_blo + '-' + titulo + '-' + nom_mat
      )}.${fileExt}`;
      
      const resp = await useUploads(
        '/tarea/',
        {
          ...obFile,
          fileName: serverFileName,
        },
        {
          doc_tar: obFile.name,
          id_ent_cop: identificador_copia,
          id_alu_ram: data_alumno?.id_alu_ram,
        },
        token ?? ''
      );
      
      setLoading(false);
      
      if (resp.trans === true) {
        setTypeMsg('success');
        setAlertMsg('Actividad entregada exitosamente.');
        setObFile(initialStateObFile);
      } else {
        setTypeMsg('error');
        setAlertMsg('La actividad no se pudo entregar, por favor, vuelva a intentarlo. \n' + resp.msg);
      }
      
    } catch (error: any) {
      setLoading(false);
      
      console.error('═════════════════════════════════════════');
      console.error('🔴 ERROR EN uploadFile');
      console.error('═════════════════════════════════════════');
      console.error('Error:', error);
      
      if (error.isAxiosError) {
        if (error.response) {
          setTypeMsg('error');
          setAlertMsg(`Error ${error.response.status}: ${error.response.data?.msg || error.response.data?.message || 'Error del servidor'}`);
        } else {
          setTypeMsg('error');
          setAlertMsg('Error de conexión. Verifica tu internet e intenta nuevamente.');
        }
      } else {
        setTypeMsg('error');
        setAlertMsg('Error al subir el archivo: ' + (error.message || 'desconocido'));
      }
      
      console.error('═════════════════════════════════════════');
    }
    
    getEntregableAlu();
  };

  const downloadFileFunc = () => {
    fnDownloadFile(baseUrlFiles+infoRespTarea[0].doc_tar, infoRespTarea[0].doc_tar);
  }

  const pressDelete = () => {
    setTitleEliminar('¿ELIMINAR ENTREGABLE?');
    setTextEliminar('¿Seguro que desea eliminar el entregable?, esta acción es irrevertible.');
  }

  const eliminarTarea = async () => {
    setLoading(true);
    const {data} = await cafeApi.delete('/tarea/'+infoRespTarea[0]?.id_tar);
    if(data.trans===true){
      setTypeMsg('success');
      setAlertMsg('Entrega eliminada exitosamente.');
      setTitleEliminar('');
      setTextEliminar('');
      setInfoRespTarea([]);
    }else{
      setTypeMsg('error');
      setAlertMsg('La entrega no se pudo eliminar, por favor, intentelo nuevamente.');
    }
    setLoading(false);
    getEntregableAlu();
  }

  loading && <LoadingScreen/>
  return (
    <SafeAreaView style={ styles.container }>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={titulo}/>
      <ScrollView style={{height: Dimensions.get("window").height}}>
        <View style={ styles.bodyEntDetalle }>
          <View style={ styles.entPregunta }>
            <HtmlToJsx strHtml={`<b>DESCRIPCIÓN:</b>${descripcion}`}/>
            <View style={ styles.containerRespAct }>
              {
              infoRespTarea.length ?//si ya subio un archivo muestra la opcion descargar y eliminar
                <View style={styles.containerBtnDownload}>
                  <Text style={styles.txtInfoFileToDownload}>{infoRespTarea[0].doc_tar}</Text>
                  <View style={platformTheme.fila}>
                    <Button
                      disabled={loading}
                      loading={loading}
                      icon="arrow-down"
                      textColor='white'
                      onPress={()=>downloadFileFunc()}
                      style={ [platformTheme.btnDownload, {margin: 5}] }
                    >DESCARGAR</Button>
                    <Button
                      disabled={loading}
                      loading={loading}
                      icon="delete"
                      textColor='white'
                      onPress={pressDelete}
                      style={ [platformTheme.btnDownload, {flex: 1, margin: 5, backgroundColor: colors.error, borderRadius: 10}] }
                    >ELIMINAR</Button>
                  </View>
                </View>
              :
                obFile.uri ?
                  <View>
                    <Text style={ styles.txtFileName }>{obFile.name}</Text>
                    <View style={{...platformTheme.fila, alignSelf: 'center'}}>
                      <Button
                        disabled={loading}
                        loading={loading}
                        icon="arrow-up"
                        textColor='white'
                        onPress={uploadFile}
                        style={ [platformTheme.btnSuccess, platformTheme.btn] }
                      >{loading ? 'SUBIENDO...' : 'SUBIR ARCHIVO'}</Button>
                      <Button
                        disabled={loading}
                        loading={loading}
                        icon="cancel"
                        textColor='white'
                        onPress={()=>setObFile(initialStateObFile)}
                        style={ [platformTheme.btnDanger, platformTheme.btn] }
                      >CANCELAR</Button>
                    </View>
                  </View>
                :
                  <View>
                    <View style={ { ...platformTheme.fila, alignSelf: 'center', marginBottom: 10 } }>
                      <Button 
                        loading={loading}
                        disabled={loading}
                        icon="camera"
                        textColor='white'
                        onPress={() => getPhoto('photo')}
                        style={ [platformTheme.btnSoftBlue, platformTheme.btn, {flex: 1}] }
                      >CAMARA</Button>
                      <Button
                        loading={loading}
                        disabled={loading}
                        icon="image"
                        textColor='white'
                        onPress={() => getPhoto('img')}
                        style={ [platformTheme.btnSuccess, platformTheme.btn, {flex: 1}] }
                      >GALERIA</Button>
                    </View>
                    <Button
                        disabled={loading}
                        loading={loading}
                        icon="file"
                        textColor='white'
                        onPress={loadFile}
                        style={ [platformTheme.btnPrimary, platformTheme.btn] }
                    >SELECCIONAR ARCHIVO</Button>
                  </View>
              }
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{paddingLeft: 20}}>
        <ChatAlumno/>
      </View>
      <ModalMessages
        visible={alertMsg!==''}
        typeMsgModal={typeMsg}
        modalText={alertMsg}
        onDismiss={()=>setAlertMsg('')}
      />
      <PaperConfirmEliminar
        visible={titleEliminar!==''}
        title={titleEliminar}
        text={textEliminar}
        evDismiss={()=>{setTitleEliminar('');setTextEliminar('');}}
        btnDisabled={loading}
        pressDelete={eliminarTarea}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 20,
    marginTop: 10,
  },
  bodyEntDetalle: { 
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 80,
  },
  entPregunta: {
    ...platformTheme.floating,
    backgroundColor: colors.softSilver,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginRight: 20,
    borderRadius: 10
  },
  containerRespAct: {
    ...platformTheme.floating,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  titleRepAct:{
      fontWeight: 'bold',
      fontSize: 20,
      color: colors.darkBlue,
  },
  txtFileName: {
      textAlign: 'center',
      padding: 10,
      fontSize: 18,
      color: colors.darkBlue,
  },
  textInfoFileUploaded: {
      color: colors.darkBlue,
      textAlign: 'center',
      fontSize: 15,
      marginBottom: 10
  },
  txtInfoFileToDownload: {
      textAlign: 'center',
      fontSize: 18,
      color: colors.darkBlue,
      marginBottom: 10
  },
  containerBtnDownload: {
      marginBottom: 20,
      backgroundColor: colors.white,
      padding: 10,
      borderRadius: 10,
  }
});