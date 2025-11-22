import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
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

  // ========== REFRESH ==========
  const onRefresh = async () => {
    setRefreshing(true);
    await getEntregableAlu();
    setRefreshing(false);
  };

  // ========== OBTENER ENTREGABLE ==========
  const getEntregableAlu = async () => {
    try {
      console.log('\n═══════════════════════════════════════');
      console.log('🔄 OBTENIENDO ENTREGABLE DEL ALUMNO');
      console.log('═══════════════════════════════════════');
      console.log('ID Entregable Copia:', identificador_copia);
      console.log('ID Alumno RAM:', data_alumno?.id_alu_ram);
      
      setLoading(true);
      const {data} = await cafeApi.get('/tarea', {
        params: {
          id_ent_cop: identificador_copia, 
          id_alu_ram: data_alumno?.id_alu_ram
        }
      });
      
      console.log('📥 RESPUESTA DEL GET /tarea:');
      console.log(JSON.stringify(data, null, 2));
      
      if(data.trans){
        console.log('✅ Datos recibidos:', data.data.length, 'registros');
        if (data.data.length > 0) {
          console.log('📋 DETALLE DEL REGISTRO:');
          console.log(JSON.stringify(data.data[0], null, 2));
        }
        setInfoRespTarea(data.data);
      } else {
        console.log('⚠️ Sin datos de entregable');
        setInfoRespTarea([]);
      }
      
      console.log('═══════════════════════════════════════\n');
      
    } catch (error: any) {
      console.error('═══════════════════════════════════════');
      console.error('❌ ERROR AL OBTENER ENTREGABLE');
      console.error('═══════════════════════════════════════');
      console.error('Error completo:', error);
      console.error('Response:', error.response?.data);
      console.error('═══════════════════════════════════════\n');
      setInfoRespTarea([]);
    } finally {
      setLoading(false);
    }
  }

  // ========== MANEJO DE ERRORES DOCUMENT PICKER ==========
  const handleError = (err: unknown) => {
    if (DocumentPicker.isCancel(err)) {
      console.log('📱 Usuario canceló selección');
    } else {
      console.error('❌ Error en DocumentPicker:', err);
      throw err;
    }
  }

  // ========== SELECCIONAR ARCHIVO (CON FIX PARA ANDROID) ==========
  const loadFile = async () => {
    try {
      const file: any = await DocumentPicker.pickSingle({
        copyTo: 'cachesDirectory', // 🔥 CLAVE: Copiar a cache (Android)
      });
      
      console.log('═══════════════════════════════════════');
      console.log('📁 ARCHIVO SELECCIONADO');
      console.log('═══════════════════════════════════════');
      console.log('Nombre:', file.name);
      console.log('URI original:', file.uri);
      console.log('URI copia:', file.fileCopyUri);
      console.log('Tipo:', file.type);
      console.log('Tamaño:', file.size, 'bytes');
      console.log('═══════════════════════════════════════\n');
      
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

  // ========== TOMAR FOTO / GALERÍA (CON FIX PARA ANDROID) ==========
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
        cameraType: 'back',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        saveToPhotos: false, // 🔥 No guardar en galería
      });
    } else {
      result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      });
    }
    
    if (result.assets) {
      const asset = result.assets[0];
      
      console.log('═══════════════════════════════════════');
      console.log('📸 FOTO/IMAGEN SELECCIONADA');
      console.log('═══════════════════════════════════════');
      console.log('Nombre:', asset.fileName);
      console.log('URI:', asset.uri);
      console.log('Tipo:', asset.type);
      console.log('Tamaño:', asset.fileSize, 'bytes');
      console.log('═══════════════════════════════════════\n');
      
      setObFile({
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        uri: asset.uri, // 🔥 Este URI ya es válido desde la cámara/galería
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
        fileCopyUri: asset.uri,
      });
    }
  };

  // ========== SUBIR ARCHIVO (CON VALIDACIONES MEJORADAS) ==========
  const uploadFile = async () => {
    console.log('\n\n');
    console.log('═══════════════════════════════════════');
    console.log('🔥 INICIANDO PROCESO DE UPLOAD');
    console.log('═══════════════════════════════════════');
    console.log('📦 Información del archivo:');
    console.log('   Nombre:', obFile.name);
    console.log('   URI:', obFile.uri);
    console.log('   Tipo MIME:', obFile.type);
    console.log('   Tamaño:', obFile.size, 'bytes');
    console.log('   FileCopyUri:', obFile.fileCopyUri);
    
    const arrFileName = obFile.name.split('.');
    const fileExt = arrFileName[arrFileName.length - 1];
    console.log('   Extensión:', fileExt);
    console.log('═══════════════════════════════════════\n');
    
    try {
      // ========== VALIDACIONES ESTRICTAS ==========
      console.log('🔍 Ejecutando validaciones...');
      
      if (!obFile.name || obFile.name === "") {
        console.log('❌ VALIDACIÓN FALLIDA: Nombre vacío');
        setTypeMsg('error');
        setAlertMsg('El archivo no tiene nombre válido.');
        return false;
      }
      console.log('✅ Validación 1/3: Nombre OK');
      
      if (!obFile.uri || obFile.uri === '') {
        console.log('❌ VALIDACIÓN FALLIDA: URI vacío');
        setTypeMsg('error');
        setAlertMsg('No se pudo acceder al archivo. Por favor, selecciónalo nuevamente.');
        return false;
      }
      console.log('✅ Validación 2/3: URI OK');
      
      // Validar tipo de archivo
      if (!obFile.type) {
        console.warn('⚠️ Sin tipo MIME, asignando por defecto');
        obFile.type = 'application/octet-stream';
      }
      console.log('✅ Validación 3/3: Tipo MIME OK');
      
      console.log('✅ TODAS LAS VALIDACIONES PASADAS\n');
      
      setLoading(true);
      
      // ========== PREPARAR NOMBRE DEL ARCHIVO ==========
      const serverFileName = `${nombreGuionesMinus(
        data_alumno?.nom_gen + '-' + 
        data_alumno?.nom_alu + '-' + 
        nom_blo + '-' + 
        titulo + '-' + 
        nom_mat
      )}.${fileExt}`;
      
      console.log('═══════════════════════════════════════');
      console.log('📝 PREPARANDO DATOS PARA ENVÍO');
      console.log('═══════════════════════════════════════');
      console.log('Nombre original:', obFile.name);
      console.log('Nombre en servidor:', serverFileName);
      console.log('ID Entregable Copia:', identificador_copia);
      console.log('ID Alumno RAM:', data_alumno?.id_alu_ram);
      console.log('═══════════════════════════════════════\n');
      
      // ========== PREPARAR DATOS ADICIONALES ==========
      const additionalData = {
        doc_tar: obFile.name,
        id_ent_cop: identificador_copia,
        id_alu_ram: data_alumno?.id_alu_ram,
      };
      
      console.log('⏳ Enviando petición al servidor...');
      console.log('🌐 Endpoint: /tarea/');
      console.log('📤 Método: POST (multipart/form-data)\n');
      
      // ========== UPLOAD ==========
      const resp = await useUploads(
        '/tarea/',
        {
          ...obFile,
          fileName: serverFileName,
          name: serverFileName, // 🔥 Asegurar que el nombre sea correcto
        },
        additionalData
      );
      
      console.log('═══════════════════════════════════════');
      console.log('📨 RESPUESTA RECIBIDA DEL SERVIDOR');
      console.log('═══════════════════════════════════════');
      console.log(JSON.stringify(resp, null, 2));
      console.log('═══════════════════════════════════════\n');
      
      // ========== PROCESAR RESPUESTA ==========
      if (resp.trans === true) {
        console.log('✅✅✅ UPLOAD EXITOSO ✅✅✅\n');
        setTypeMsg('success');
        setAlertMsg('Actividad entregada exitosamente.');
        setObFile(initialStateObFile);
        await getEntregableAlu();
      } else {
        console.log('═══════════════════════════════════════');
        console.log('⚠️ UPLOAD FALLIDO - RESPUESTA NEGATIVA');
        console.log('═══════════════════════════════════════');
        console.log('trans:', resp.trans);
        console.log('msg:', resp.msg);
        console.log('data:', resp.data);
        console.log('═══════════════════════════════════════\n');
        
        setTypeMsg('error');
        setAlertMsg(
          'La actividad no se pudo entregar:\n' + 
          (resp.msg || 'Error desconocido del servidor')
        );
      }
      
    } catch (error: any) {
      console.log('\n');
      console.error('═══════════════════════════════════════');
      console.error('💥 ERROR CRÍTICO EN UPLOAD');
      console.error('═══════════════════════════════════════');
      console.error('Tipo de error:', error.name);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('═══════════════════════════════════════');
      
      if (error.response) {
        console.error('📥 RESPUESTA DEL SERVIDOR (ERROR):');
        console.error('═══════════════════════════════════════');
        console.error('Status Code:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Headers:', error.response.headers);
        console.error('═══════════════════════════════════════\n');
        
        setTypeMsg('error');
        setAlertMsg(
          `Error del servidor (${error.response.status}):\n${
            error.response.data?.msg || 
            error.response.data?.message || 
            JSON.stringify(error.response.data) ||
            'Error desconocido'
          }`
        );
      } else if (error.request) {
        console.error('📡 SIN RESPUESTA DEL SERVIDOR:');
        console.error('═══════════════════════════════════════');
        console.error('Request enviado pero sin respuesta');
        console.error('Request:', error.request);
        console.error('═══════════════════════════════════════\n');
        
        setTypeMsg('error');
        setAlertMsg('Sin respuesta del servidor. Verifica tu conexión a internet.');
      } else {
        console.error('⚠️ ERROR ANTES DE ENVIAR REQUEST:');
        console.error('═══════════════════════════════════════');
        console.error('Error al preparar la petición');
        console.error('Detalles:', error);
        console.error('═══════════════════════════════════════\n');
        
        setTypeMsg('error');
        setAlertMsg('Error al preparar el archivo: ' + error.message);
      }
      
    } finally {
      console.log('🏁 Proceso de upload finalizado\n\n');
      setLoading(false);
    }
  };

  // ========== DESCARGAR ARCHIVO (CON FIX URL ENCODING) ==========
  const downloadFileFunc = () => {
    const fileName = infoRespTarea[0].doc_tar;
    
    console.log('═══════════════════════════════════════');
    console.log('📥 INICIANDO DESCARGA');
    console.log('═══════════════════════════════════════');
    console.log('Nombre original:', fileName);
    console.log('Nombre decodificado:', decodeURIComponent(fileName));
    console.log('URL completa:', baseUrlFiles + fileName);
    console.log('═══════════════════════════════════════\n');
    
    // 🔥 Decodificar el nombre del archivo para mostrar correctamente
    const decodedFileName = decodeURIComponent(fileName);
    
    fnDownloadFile(
      baseUrlFiles + fileName, // URL con encoding (servidor lo espera así)
      decodedFileName          // Nombre local sin encoding
    );
  }

  // ========== CONFIRMAR ELIMINACIÓN ==========
  const pressDelete = () => {
    setTitleEliminar('¿Eliminar entregable?');
    setTextEliminar('¿Seguro que desea eliminar el entregable? Esta acción es irreversible.');
  }

  // ========== ELIMINAR TAREA ==========
  const eliminarTarea = async () => {
    try {
      setLoading(true);
      const {data} = await cafeApi.delete('/tarea/' + infoRespTarea[0]?.id_tar);
      
      if (data.trans === true) {
        setTypeMsg('success');
        setAlertMsg('Entrega eliminada exitosamente.');
        setTitleEliminar('');
        setTextEliminar('');
        setInfoRespTarea([]);
        await getEntregableAlu();
      } else {
        setTypeMsg('error');
        setAlertMsg('La entrega no se pudo eliminar, por favor, intentelo nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      setTypeMsg('error');
      setAlertMsg('Error al eliminar la entrega.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen/>

  return (
    <View style={styles.container}>
      {/* ========== HEADER ========== */}
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

      {/* ========== CONTENT ========== */}
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
            // ========== ARCHIVO YA SUBIDO ==========
            <View style={styles.uploadedFile}>
              <View style={styles.fileInfo}>
                <Icon name="file-check" size={40} color="#34C759" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileLabel}>Archivo entregado</Text>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {decodeURIComponent(infoRespTarea[0].doc_tar)}
                  </Text>
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
            // ========== ARCHIVO SELECCIONADO ==========
            <View style={styles.selectedFile}>
              <View style={styles.selectedFileInfo}>
                <Icon name="file" size={32} color="#666" />
                <Text style={styles.selectedFileName} numberOfLines={2}>
                  {obFile.name}
                </Text>
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
            // ========== SELECCIONAR ARCHIVO ==========
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

      {/* ========== CHAT ========== */}
      <ChatAlumno/>

      {/* ========== MODALES ========== */}
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
    backgroundColor: '#FF6B6B',
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