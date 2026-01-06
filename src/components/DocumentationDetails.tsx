import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { FilePick, IntDocumentationCard, PropsDocumentationDetails } from '../interfaces/appInterfaces';
import { BackButtonNavigation } from './BackButtonNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentationCard from './DocumentationCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import { useUploads } from '../hooks/useUploads';
import { nombreGuionesMinus, formatDate } from '../hooks/useFormats';
import { fnDownloadFile } from '../hooks/useDownloads';
import { baseUrlFiles } from '../hooks/useGlobal';
import { colors, platformTheme } from '../theme/platformTheme';
import PaperMessages from './PaperMessages';
import { LoadingScreen } from '../screens/LoadingScreen';
import endeApi from '../api/estudianteAPI';
import { useTheme } from '../context/ThemeContext';

const DocumentationDetails = ({ route, navigation }: PropsDocumentationDetails) => {
  const { colors: themeColors, theme } = useTheme();
  const params = route.params;

  // Detección robusta del tema oscuro (propagado desde Actividades)
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 DOCUMENTATION_DETAILS - themeColors.background:', themeColors.background);
    console.log('🌓 DOCUMENTATION_DETAILS - themeColors.backgroundCard:', themeColors.backgroundCard);
    
    const isDark = bg === '#000' || 
                   bg === '#000000' ||
                   bg === '#121212' || 
                   bg === '#1a1a1a' ||
                   cardBg === '#000' ||
                   cardBg === '#000000' ||
                   cardBg === '#121212' ||
                   cardBg === '#1e1e1e' ||
                   cardBg === '#1a1a1a' ||
                   textPrimary === '#fff' ||
                   textPrimary === '#ffffff' ||
                   textPrimary === '#f5f5f5' ||
                   bg.includes('black') ||
                   (bg.startsWith('#') && parseInt(bg.replace('#', ''), 16) < 3355443);
    
    console.log('🌓 DOCUMENTATION_DETAILS - isDarkTheme resultado:', isDark);
    
    return isDark;
  })();

  const initialStateObFile = { fileCopyUri: null, name: "", size: 0, type: "", uri: "" };
  const [obFile, setObFile] = useState<FilePick>(initialStateObFile);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alerts, setAlerts] = useState({'type': '', 'title': '', 'message': '', });
  const [documentation, setDocumentation] = useState(params.documentation)

  const handleError = (err: unknown) => {
    if (DocumentPicker.isCancel(err)) {
      console.log('cancelled', err)
    } else {
      throw err
    }
  }
  
  const loadFile = async () => {
    try {
      const file:any = await DocumentPicker.pickSingle();
      const [fileName, fileSize, fileType] = [file.name, file.size, file.type];
      if(fileSize > 5242880) {
        setAlerts({ 'type': 'error', 'title': 'Error', 'message': 'El archivo no debe superar los 5MB.' });
        return
      }
      const tmpName = fileName.split('.');
      if (!['pdf', 'jpeg', 'jpg', 'png'].includes(tmpName[tmpName.length - 1].toLowerCase())) {
        setAlerts({ 'type': 'error', 'title': 'Error', 'message': 'Formato de archivo no válido. Debe ser pdf, jpeg, jpg o png.' });
        return
      }
      setObFile(file);
    } catch (error) {
      handleError(error);
    }
  }

  const uploadFile = async () => {
    try { 
      if(obFile.name==="") return false;
      setUploading(true);
      const serverFileName = nombreGuionesMinus(obFile.name);
      if (!serverFileName) {
        setAlerts({ 'type': 'error', 'title': 'Error', 'message': 'El nombre del archivo no es válido.' });
        setUploading(false);
        return;
      }
      const resp = await useUploads(
        '/documento_alu_ram/uploadfile/'+documentation.id_doc_alu_ram,
        { ...obFile, fileName: serverFileName },
        {}
      );
      setUploading(false);
      if (resp.trans === true) {
        setObFile(initialStateObFile);
        setAlerts({ 'type': 'success', 'title': 'Éxito', 'message': 'Archivo subido exitosamente.' });
        const dataUpdated = resp.dataUpdated;
        setDocumentation({
          ...documentation,
          ...dataUpdated
        });
      }
      setUploading(false);
    } catch (error:any) {
      setUploading(false);
      setAlerts({ 'type': 'error', 'title': 'Error', 'message': 'Error al subir el archivo' });
      console.log('Error al subir el archivo', error);
    }
  }

  const downloadFileFunc = () => {
    fnDownloadFile(baseUrlFiles + documentation.arc_doc_alu_ram, documentation.arc_doc_alu_ram ?? 'Archivo sin nombre');
  }

  const confirmDeleteFile = () => {
    setAlerts({
      'type': 'confirmDelete',
      'title': 'Confirmar eliminación',
      'message': '¿Estás seguro de que deseas eliminar este archivo?',
    });
  }

  const deleteFileFunc = async () => {
    try {
      setDeleting(true);
      const {data} = await endeApi.delete('/documento_alu_ram/' + documentation.id_doc_alu_ram);
      if(data.trans === true) {
        const newDoc = documentation;
        newDoc.arc_doc_alu_ram = null;
        if(documentation.est_doc_alu_ram!=='Aprobado') {
          newDoc.est_doc_alu_ram = 'Pendiente';
        }
        setDocumentation(newDoc);
        setObFile(initialStateObFile);
        setAlerts({ 'type': 'success', 'title': 'Éxito', 'message': 'Archivo eliminado exitosamente.' });
      } else {
        setAlerts({ 'type': 'error', 'title': 'Error', 'message': data.msg || 'Error al eliminar el archivo.' });
      }
    } catch (error:any) {
      console.log('Error al eliminar el archivo:', error);
      setAlerts({ 'type': 'error', 'title': 'Error', 'message': error.message });
    } finally {
      setDeleting(false);
    }
  }

  if (uploading || deleting) {
    return <LoadingScreen text={`${uploading ? 'Subiendo' : 'Eliminando'} archivo...`} />;
  }

  // Estilos de info card con colores pastel
  const getInfoCardStyle = () => {
    if (isDarkTheme) {
      return {
        bg: '#2A2F35', // Azul muy oscuro
        iconColor: '#9DB4C8', // Azul pastel
        textColor: '#9DB4C8' // Azul pastel
      };
    } else {
      return {
        bg: '#E3F2FD',
        iconColor: '#1976D2',
        textColor: '#1976D2'
      };
    }
  };

  // Estilos de iconos con colores pastel
  const getIconColors = () => {
    if (isDarkTheme) {
      return {
        success: '#A8C4A8', // Verde pastel
        error: '#D0A8A0', // Rosa salmón pastel
        document: '#9DB4C8', // Azul pastel
        upload: '#666' // Gris suave
      };
    } else {
      return {
        success: '#34C759',
        error: '#E53935',
        document: '#1976D2',
        upload: themeColors.borderGray
      };
    }
  };

  const infoStyle = getInfoCardStyle();
  const iconColors = getIconColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButtonNavigation onPressBack={() => navigation.pop()} title={documentation.nom_doc_ram}/>
        
        <View style={styles.cardContainer}>
          <DocumentationCard data_doc={documentation} onPressEvnt={false}/>
        </View>

        {documentation.est_doc_alu_ram === 'Pendiente' ? (
          <View style={styles.uploadSection}>
            <View style={[styles.infoCard, { backgroundColor: infoStyle.bg }]}>
              <Icon name="information-outline" size={20} color={infoStyle.iconColor} />
              <Text style={[styles.infoText, { color: infoStyle.textColor }]}>
                Formatos válidos: <Text style={styles.infoBold}>PDF, JPEG, JPG, PNG</Text> (máx. 5MB)
              </Text>
            </View>

            {obFile.name !== "" ? (
              <View style={[
                styles.fileSelectedCard, 
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  borderWidth: isDarkTheme ? 1 : 0
                }
              ]}>
                <View style={styles.fileSelectedHeader}>
                  <Icon name="file-check-outline" size={24} color={iconColors.success} />
                  <View style={styles.fileSelectedInfo}>
                    <Text style={[styles.fileSelectedName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                      {obFile.name}
                    </Text>
                    <Text style={[styles.fileSelectedSize, { color: themeColors.textSecondary }]}>
                      {(obFile.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setObFile(initialStateObFile)} activeOpacity={0.7}>
                    <Icon name="close-circle" size={24} color={iconColors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={[
                      styles.button, 
                      styles.buttonPrimary, 
                      { 
                        backgroundColor: isDarkTheme ? '#4E5C6A' : '#000000',
                        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                        borderWidth: isDarkTheme ? 1 : 0
                      }
                    ]} 
                    onPress={uploadFile}
                  >
                    <Icon name="cloud-upload-outline" size={20} color="#FFFFFF" />
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Subir archivo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={[
                      styles.button, 
                      styles.buttonSecondary, 
                      { 
                        backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray,
                        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        borderWidth: isDarkTheme ? 1 : 0
                      }
                    ]} 
                    onPress={() => setObFile(initialStateObFile)}
                  >
                    <Icon name="close" size={20} color={themeColors.textSecondary} />
                    <Text style={[styles.buttonText, { color: themeColors.textSecondary }]}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={[
                  styles.uploadCard, 
                  { 
                    backgroundColor: themeColors.backgroundCard,
                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : themeColors.borderGray
                  }
                ]} 
                onPress={loadFile}
              >
                <Icon name="cloud-upload-outline" size={64} color={iconColors.upload} />
                <Text style={[styles.uploadTitle, { color: themeColors.textPrimary }]}>Seleccionar archivo</Text>
                <Text style={[styles.uploadSubtitle, { color: themeColors.textSecondary }]}>
                  Toca para elegir un documento
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          documentation.est_doc_alu_ram === 'Entregado' || 
          (documentation.est_doc_alu_ram === 'Aprobado' && documentation.arc_doc_alu_ram && documentation.arc_doc_alu_ram!=='')
        ) ? (
          <View style={styles.uploadSection}>
            <View style={[
              styles.fileCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                borderWidth: isDarkTheme ? 1 : 0
              }
            ]}>
              <View style={styles.fileHeader}>
                <Icon name="file-document-outline" size={48} color={iconColors.document} />
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                    {documentation.arc_doc_alu_ram ?? 'Archivo sin nombre'}
                  </Text>
                  {documentation.fec_doc_alu_ram && (
                    <Text style={[styles.fileDate, { color: themeColors.textSecondary }]}>
                      Entregado: {formatDate(documentation.fec_doc_alu_ram, '/')}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.buttonPrimary, 
                    { 
                      backgroundColor: isDarkTheme ? '#4E5C6A' : '#000000',
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                      borderWidth: isDarkTheme ? 1 : 0
                    }
                  ]} 
                  onPress={downloadFileFunc}
                  activeOpacity={0.7}
                >
                  <Icon name="download-outline" size={20} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Descargar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.buttonDanger,
                    { 
                      backgroundColor: isDarkTheme ? '#7A5E5B' : '#E53935',
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                      borderWidth: isDarkTheme ? 1 : 0
                    }
                  ]} 
                  onPress={confirmDeleteFile}
                  activeOpacity={0.7}
                >
                  <Icon name="trash-can-outline" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <PaperMessages
        visible={alerts.type !== ''}
        title={alerts.title}
        message={alerts.message}
        buttonText={alerts.type === 'confirmDelete' ? 'Confirmar' : 'Aceptar'}
        dismissable={true}
        styleButton={alerts.type === 'error' ? platformTheme.btnDanger : platformTheme.btnSuccess}
        colorTitle={alerts.type === 'error' ? colors.error : colors.success}
        colorBody={colors.darkSilver}
        onDismiss={() => setAlerts({'type': '', 'title': '', 'message': ''})}
        pressButton={() => {
          if (alerts.type === 'confirmDelete') {
            deleteFileFunc();
          }else {
            setAlerts({'type': '', 'title': '', 'message': ''});
          }
        }}
        btnTxtCancel={alerts.type === 'confirmDelete' ? 'Cancelar' : ''}
        evtBtnCancel={() => setAlerts({'type': '', 'title': '', 'message': ''})}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  uploadSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
  },
  infoBold: {
    fontWeight: '700',
  },
  uploadCard: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
  },
  fileSelectedCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  fileSelectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  fileSelectedInfo: {
    flex: 1,
  },
  fileSelectedName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileSelectedSize: {
    fontSize: 12,
  },
  fileCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  buttonPrimary: {
  },
  buttonSecondary: {
  },
  buttonDanger: {
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DocumentationDetails;