import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { FilePick, PropsActividad, TypesMsgModalType } from '../interfaces/appInterfaces';
import DocumentPicker from 'react-native-document-picker';
import { colors } from '../theme/platformTheme';
import { nombreGuionesMinus } from '../hooks/useFormats';
import cafeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { useUploads } from '../hooks/useUploads';
import { ModalMessages } from '../components/ModalMessages';
import { baseUrlFiles } from '../hooks/useGlobal';
import { fnDownloadFile } from '../hooks/useDownloads';
import { PaperConfirmEliminar } from '../components/PaperConfirmEliminar';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';
import { requestCameraPermission } from '../hooks/usePermisions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Entregable = ({route, navigation}: PropsActividad) => {
  const initialStateObFile = { fileCopyUri: null, name: "", size: 0, type: "", uri: "" };
  const { data_alumno } = useContext(AuthContext);
  const {identificador, titulo, descripcion, identificador_copia, nom_blo, nom_mat} = route.params.data_actividad;
  const [infoRespTarea, setInfoRespTarea] = useState<any>([]);
  const [obFile, setObFile] = useState<FilePick>(initialStateObFile);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [typeMsg, setTypeMsg] = useState<TypesMsgModalType>('success');
  const [titleEliminar, setTitleEliminar] = useState('');
  const [textEliminar, setTextEliminar] = useState('');

  useEffect(() => {
    getEntregableAlu();
  }, [])

  const onRefresh = async () => {
    setRefreshing(true);
    await getEntregableAlu();
    setRefreshing(false);
  };

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

  const handleError = (err: unknown) => {
    if (DocumentPicker.isCancel(err)) {
      console.log('cancelled', err)
    } else {
      throw err
    }
  }

  const loadFile = async () => {
    try {
      const file: any = await DocumentPicker.pickSingle();
      setObFile(file);
    } catch (error) {
      handleError(error);
    }
  }

  const getPhoto = async (type: 'photo' | 'img') => {
    let result: any = { assets: undefined };
    if(type === 'photo'){
      const permission = await requestCameraPermission();
      if(!permission){
        setTypeMsg('error');
        setAlertMsg('No se ha concedido el permiso para usar la cámara.');
        return false;
      }
      result = await launchCamera({mediaType: 'photo', cameraType: 'front', maxWidth: 500, maxHeight: 500});
    }else{
      result = await launchImageLibrary({mediaType: 'photo', maxWidth: 500, maxHeight: 500});
    }
    if(result.assets){
      setObFile({...result.assets[0], name: result.assets[0].fileName});
    }
  }

  const uploadFile = async () => {
    console.log('🔥 INICIANDO UPLOAD');
    console.log('📦 obFile:', obFile);
    
    const arrFileName = obFile.name.split('.');
    const fileExt = arrFileName[arrFileName.length - 1];
    
    if(obFile.name === "") {
      console.log('❌ Nombre vacío');
      return false;
    }
    
    try { 
      console.log('✅ Iniciando setLoading(true)');
      setLoading(true);
      
      const serverFileName = `${nombreGuionesMinus(data_alumno?.nom_gen + '-' + data_alumno?.nom_alu + '-' + nom_blo + '-' + titulo + '-' + nom_mat)}.${fileExt}`;
      console.log('📝 Server filename:', serverFileName);
      
      const uploadData = {
        file: {...obFile, fileName: serverFileName},
        params: {doc_tar: obFile.name, id_ent_cop: identificador_copia, id_alu_ram: data_alumno?.id_alu_ram}
      };
      console.log('📤 Datos a enviar:', uploadData);
      
      console.log('⏳ Llamando useUploads...');
      const resp = await useUploads(
        '/tarea/', 
        {...obFile, fileName: serverFileName}, 
        {doc_tar: obFile.name, id_ent_cop: identificador_copia, id_alu_ram: data_alumno?.id_alu_ram}
      );
      console.log('📨 Respuesta:', resp);
      
      if(resp.trans === true){
        setTypeMsg('success');
        setAlertMsg('Actividad entregada exitosamente.');
        setObFile(initialStateObFile);
        await getEntregableAlu();
      }else{
        setTypeMsg('error');
        setAlertMsg('La actividad no se pudo entregar, por favor, vuelva a intentarlo. \n' + resp.msg);
      }
    } catch (error: any) {
      console.log('💥 ERROR CATCH:', error);
      console.log('💥 ERROR MESSAGE:', error.message);
      console.log('💥 ERROR STACK:', error.stack);
      setTypeMsg('error');
      setAlertMsg('Error inesperado: ' + error.message);
    } finally {
      console.log('🏁 Terminando - setLoading(false)');
      setLoading(false);
    }
  }

  const downloadFileFunc = () => {
    fnDownloadFile(baseUrlFiles + infoRespTarea[0].doc_tar, infoRespTarea[0].doc_tar);
  }

  const pressDelete = () => {
    setTitleEliminar('¿Eliminar entregable?');
    setTextEliminar('¿Seguro que desea eliminar el entregable? Esta acción es irreversible.');
  }

  const eliminarTarea = async () => {
    setLoading(true);
    const {data} = await cafeApi.delete('/tarea/' + infoRespTarea[0]?.id_tar);
    if(data.trans === true){
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

  if(loading) return <LoadingScreen/>

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
          <Text style={styles.headerSubtitle}>Actividad entregable</Text>
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
        {/* DESCRIPCIÓN */}
        <View style={styles.descriptionCard}>
          <View style={styles.descriptionHeader}>
            <Icon name="file-document-outline" size={20} color="#666" />
            <Text style={styles.descriptionTitle}>Descripción</Text>
          </View>
          <View style={styles.descriptionContent}>
            <HtmlToJsx strHtml={descripcion}/>
          </View>
        </View>

        {/* ÁREA DE ENTREGA */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadHeader}>
            <Icon name="cloud-upload" size={20} color="#000" />
            <Text style={styles.uploadTitle}>Tu entrega</Text>
          </View>

          {infoRespTarea.length ? (
            // ARCHIVO YA SUBIDO
            <View style={styles.uploadedFile}>
              <View style={styles.fileInfo}>
                <Icon name="file-check" size={40} color="#34C759" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileLabel}>Archivo entregado</Text>
                  <Text style={styles.fileName} numberOfLines={2}>{infoRespTarea[0].doc_tar}</Text>
                </View>
              </View>

              <View style={styles.fileActions}>
                <TouchableOpacity 
                  style={[styles.downloadButton, loading && styles.buttonDisabled]}
                  onPress={downloadFileFunc}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="download" size={18} color="#FFF" />
                  <Text style={styles.downloadButtonText}>Descargar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.deleteButton, loading && styles.buttonDisabled]}
                  onPress={pressDelete}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="delete-outline" size={18} color="#FFF" />
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : obFile.uri ? (
            // ARCHIVO SELECCIONADO
            <View style={styles.selectedFile}>
              <View style={styles.selectedFileInfo}>
                <Icon name="file" size={32} color="#666" />
                <Text style={styles.selectedFileName} numberOfLines={2}>{obFile.name}</Text>
              </View>

              <View style={styles.selectedFileActions}>
                <TouchableOpacity 
                  style={[styles.uploadButton, loading && styles.buttonDisabled]}
                  onPress={uploadFile}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="upload" size={18} color="#FFF" />
                  <Text style={styles.uploadButtonText}>
                    {loading ? 'Subiendo...' : 'Subir archivo'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.cancelButton, loading && styles.buttonDisabled]}
                  onPress={() => setObFile(initialStateObFile)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // SELECCIONAR ARCHIVO
            <View style={styles.selectOptions}>
              <View style={styles.imageOptions}>
                <TouchableOpacity 
                  style={[styles.imageButton, loading && styles.buttonDisabled]}
                  onPress={() => getPhoto('photo')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="camera" size={24} color="#666" />
                  <Text style={styles.imageButtonText}>Cámara</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.imageButton, loading && styles.buttonDisabled]}
                  onPress={() => getPhoto('img')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="image" size={24} color="#666" />
                  <Text style={styles.imageButtonText}>Galería</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.fileButton, loading && styles.buttonDisabled]}
                onPress={loadFile}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Icon name="folder-open" size={20} color="#FFF" />
                <Text style={styles.fileButtonText}>Seleccionar archivo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <ChatAlumno/>

      <ModalMessages
        visible={alertMsg !== ''}
        typeMsgModal={typeMsg}
        modalText={alertMsg}
        onDismiss={() => setAlertMsg('')}
      />

      <PaperConfirmEliminar
        visible={titleEliminar !== ''}
        title={titleEliminar}
        text={textEliminar}
        evDismiss={() => {setTitleEliminar(''); setTextEliminar('');}}
        btnDisabled={loading}
        pressDelete={eliminarTarea}
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
  descriptionCard: {
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
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  descriptionContent: {
    paddingLeft: 4,
  },
  uploadSection: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  uploadedFile: {
    gap: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 10,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
  deleteButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  selectedFile: {
    gap: 16,
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  selectedFileActions: {
    gap: 10,
  },
  uploadButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  selectOptions: {
    gap: 12,
  },
  imageOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  fileButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fileButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});