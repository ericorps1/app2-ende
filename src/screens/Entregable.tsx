import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform, useColorScheme, SafeAreaView } from 'react-native';
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
import { ChatAlumno } from '../components/ChatAlumno';
import { requestCameraPermission } from '../hooks/usePermisions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { WebView } from 'react-native-webview';
import { BackButtonNavigation } from '../components/BackButtonNavigation';

export const Entregable = ({route, navigation}: PropsActividad) => {
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
  
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
  const [webViewHeight, setWebViewHeight] = useState(200);
  
  // 🌙 Detectar dark mode
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';

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
        copyTo: 'cachesDirectory',
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
      
      const realUri = Platform.OS === 'android' 
        ? file.fileCopyUri || file.uri 
        : file.uri;
      
      setObFile({
        ...file,
        uri: realUri,
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
        saveToPhotos: false,
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
        uri: asset.uri,
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
      
      if (!obFile.type) {
        console.warn('⚠️ Sin tipo MIME, asignando por defecto');
        obFile.type = 'application/octet-stream';
      }
      console.log('✅ Validación 3/3: Tipo MIME OK');
      
      console.log('✅ TODAS LAS VALIDACIONES PASADAS\n');
      
      setLoading(true);
      
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
      
      const additionalData = {
        doc_tar: obFile.name,
        id_ent_cop: identificador_copia,
        id_alu_ram: data_alumno?.id_alu_ram,
      };
      
      console.log('⏳ Enviando petición al servidor...');
      console.log('🌐 Endpoint: /tarea/');
      console.log('📤 Método: POST (multipart/form-data)\n');
      
      const resp = await useUploads(
        '/tarea/',
        {
          ...obFile,
          fileName: serverFileName,
          name: serverFileName,
        },
        additionalData
      );
      
      console.log('═══════════════════════════════════════');
      console.log('📨 RESPUESTA RECIBIDA DEL SERVIDOR');
      console.log('═══════════════════════════════════════');
      console.log(JSON.stringify(resp, null, 2));
      console.log('═══════════════════════════════════════\n');
      
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
    
    const decodedFileName = decodeURIComponent(fileName);
    
    fnDownloadFile(
      baseUrlFiles + fileName,
      decodedFileName
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* ========== HEADER ========== */}
      <BackButtonNavigation title={titulo} onPressBack={() => navigation.pop()} subtitle='Actividad entregable'/>

      {/* ========== CONTENT ========== */}
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
        {/* 🔥 DESCRIPCIÓN CON WEBVIEW Y DARK MODE */}
        <View style={[styles.descriptionCard, { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: themeColors.borderGray 
        }]}>
          <View style={styles.descriptionHeader}>
            <Icon name="file-document-outline" size={20} color={themeColors.textSecondary} />
            <Text style={[styles.descriptionTitle, { color: themeColors.textPrimary }]}>
              Descripción
            </Text>
          </View>
          <View style={[styles.webViewContainer, {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderColor: themeColors.borderGray
          }]}>
            <WebView
              source={{ html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                      * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                      }
                      html, body {
                        width: 100%;
                        height: auto;
                        overflow-x: hidden;
                      }
                      body { 
                        padding: 12px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        color: ${isDarkMode ? '#e0e0e0' : '#1a1a1a'};
                        background-color: ${isDarkMode ? '#1a1a1a' : '#FFFFFF'};
                      }
                      img { 
                        max-width: 100% !important; 
                        width: auto !important;
                        height: auto !important;
                        display: block;
                        margin: 8px 0;
                        ${isDarkMode ? 'opacity: 0.9;' : ''}
                      }
                      table {
                        max-width: 100% !important;
                        width: 100% !important;
                        border-collapse: collapse;
                        display: block;
                        overflow-x: auto;
                      }
                      p, div, span, li {
                        max-width: 100% !important;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                      }
                      h1, h2, h3, h4, h5, h6 {
                        color: ${isDarkMode ? '#ffffff' : '#1a1a1a'};
                        margin-top: 1em;
                        margin-bottom: 0.5em;
                        word-wrap: break-word;
                      }
                      a {
                        color: ${isDarkMode ? '#60a5fa' : '#2563eb'};
                        word-wrap: break-word;
                      }
                      strong, b {
                        color: ${isDarkMode ? '#ffffff' : '#000000'};
                      }
                      ul, ol {
                        padding-left: 20px;
                      }
                    </style>
                  </head>
                  <body>
                    ${descripcion}
                    <script>
                      function updateHeight() {
                        const height = document.body.scrollHeight;
                        window.ReactNativeWebView.postMessage(height);
                      }
                      
                      const images = document.getElementsByTagName('img');
                      let loadedImages = 0;
                      
                      if (images.length === 0) {
                        updateHeight();
                      } else {
                        for (let img of images) {
                          img.onload = () => {
                            loadedImages++;
                            if (loadedImages === images.length) {
                              updateHeight();
                            }
                          };
                          img.onerror = () => {
                            loadedImages++;
                            if (loadedImages === images.length) {
                              updateHeight();
                            }
                          };
                        }
                      }
                      
                      setTimeout(updateHeight, 300);
                    </script>
                  </body>
                </html>
              `}}
              style={{ height: webViewHeight }}
              scalesPageToFit={false}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              bounces={false}
              onMessage={(event) => {
                const height = Number(event.nativeEvent.data);
                if (height > 0 && height !== webViewHeight) {
                  setWebViewHeight(height + 30);
                }
              }}
            />
          </View>
        </View>

        {/* ÁREA DE ENTREGA */}
        <View style={[styles.uploadSection, { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: themeColors.borderGray 
        }]}>
          <View style={styles.uploadHeader}>
            <Icon name="cloud-upload" size={20} color={themeColors.textPrimary} />
            <Text style={[styles.uploadTitle, { color: themeColors.textPrimary }]}>
              Tu entrega
            </Text>
          </View>

          {infoRespTarea.length ? (
            // ========== ARCHIVO YA SUBIDO ==========
            <View style={styles.uploadedFile}>
              <View style={[styles.fileInfo, { backgroundColor: themeColors.backgroundGray }]}>
                <Icon name="file-check" size={40} color="#34C759" />
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileLabel, { color: themeColors.textTertiary }]}>
                    Archivo entregado
                  </Text>
                  <Text style={[styles.fileName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                    {decodeURIComponent(infoRespTarea[0].doc_tar)}
                  </Text>
                </View>
              </View>

              <View style={styles.fileActions}>
                <TouchableOpacity 
                  style={[styles.downloadButton, { backgroundColor: themeColors.textPrimary }, loading && styles.buttonDisabled]}
                  onPress={downloadFileFunc}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="download" size={18} color={themeColors.backgroundCard} />
                  <Text style={[styles.downloadButtonText, { color: themeColors.backgroundCard }]}>
                    Descargar
                  </Text>
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
              <View style={[styles.selectedFileInfo, { backgroundColor: themeColors.backgroundGray }]}>
                <Icon name="file" size={32} color={themeColors.textSecondary} />
                <Text style={[styles.selectedFileName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                  {obFile.name}
                </Text>
              </View>

              <View style={styles.selectedFileActions}>
                <TouchableOpacity 
                  style={[styles.uploadButton, { backgroundColor: themeColors.textPrimary }, loading && styles.buttonDisabled]}
                  onPress={uploadFile}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="upload" size={18} color={themeColors.backgroundCard} />
                  <Text style={[styles.uploadButtonText, { color: themeColors.backgroundCard }]}>
                    {loading ? 'Subiendo...' : 'Subir archivo'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.cancelButton, { backgroundColor: themeColors.backgroundGray }, loading && styles.buttonDisabled]}
                  onPress={() => setObFile(initialStateObFile)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: themeColors.textPrimary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // ========== SELECCIONAR ARCHIVO ==========
            <View style={styles.selectOptions}>
              <View style={styles.imageOptions}>
                <TouchableOpacity 
                  style={[styles.imageButton, { 
                    backgroundColor: themeColors.backgroundGray,
                    borderColor: themeColors.borderGray 
                  }, loading && styles.buttonDisabled]}
                  onPress={() => getPhoto('photo')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="camera" size={24} color={themeColors.textSecondary} />
                  <Text style={[styles.imageButtonText, { color: themeColors.textSecondary }]}>
                    Cámara
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.imageButton, { 
                    backgroundColor: themeColors.backgroundGray,
                    borderColor: themeColors.borderGray 
                  }, loading && styles.buttonDisabled]}
                  onPress={() => getPhoto('img')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Icon name="image" size={24} color={themeColors.textSecondary} />
                  <Text style={[styles.imageButtonText, { color: themeColors.textSecondary }]}>
                    Galería
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.fileButton, { backgroundColor: themeColors.textPrimary }, loading && styles.buttonDisabled]}
                onPress={loadFile}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Icon name="folder-open" size={20} color={themeColors.backgroundCard} />
                <Text style={[styles.fileButtonText, { color: themeColors.backgroundCard }]}>
                  Seleccionar archivo
                </Text>
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
  descriptionCard: {
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
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  webViewContainer: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  uploadSection: {
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  uploadedFile: {
    gap: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 10,
  },
  downloadButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadButtonText: {
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
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFileActions: {
    gap: 10,
  },
  uploadButton: {
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
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
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileButton: {
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fileButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});