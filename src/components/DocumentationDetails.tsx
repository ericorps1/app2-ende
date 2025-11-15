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

const DocumentationDetails = ({ route, navigation }: PropsDocumentationDetails) => {
  const params = route.params;

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
      if(fileSize > 5242880) { // 5MB
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButtonNavigation onPressBack={() => navigation.pop()} title={documentation.nom_doc_ram}/>
        
        <View style={styles.cardContainer}>
          <DocumentationCard data_doc={documentation} onPressEvnt={false}/>
        </View>

        {documentation.est_doc_alu_ram === 'Pendiente' ? (
          <View style={styles.uploadSection}>
            <View style={styles.infoCard}>
              <Icon name="information-outline" size={20} color="#1976D2" />
              <Text style={styles.infoText}>
                Formatos válidos: <Text style={styles.infoBold}>PDF, JPEG, JPG, PNG</Text> (máx. 5MB)
              </Text>
            </View>

            {obFile.name !== "" ? (
              <View style={styles.fileSelectedCard}>
                <View style={styles.fileSelectedHeader}>
                  <Icon name="file-check-outline" size={24} color="#34C759" />
                  <View style={styles.fileSelectedInfo}>
                    <Text style={styles.fileSelectedName} numberOfLines={1}>{obFile.name}</Text>
                    <Text style={styles.fileSelectedSize}>{(obFile.size / 1024).toFixed(2)} KB</Text>
                  </View>
                  <TouchableOpacity onPress={() => setObFile(initialStateObFile)} activeOpacity={0.7}>
                    <Icon name="close-circle" size={24} color="#E53935" />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={[styles.button, styles.buttonPrimary]} 
                    onPress={uploadFile}
                  >
                    <Icon name="cloud-upload-outline" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Subir archivo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={[styles.button, styles.buttonSecondary]} 
                    onPress={() => setObFile(initialStateObFile)}
                  >
                    <Icon name="close" size={20} color="#666" />
                    <Text style={[styles.buttonText, {color: '#666'}]}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={styles.uploadCard} 
                onPress={loadFile}
              >
                <Icon name="cloud-upload-outline" size={64} color="#D0D0D0" />
                <Text style={styles.uploadTitle}>Seleccionar archivo</Text>
                <Text style={styles.uploadSubtitle}>Toca para elegir un documento</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          documentation.est_doc_alu_ram === 'Entregado' || 
          (documentation.est_doc_alu_ram === 'Aprobado' && documentation.arc_doc_alu_ram && documentation.arc_doc_alu_ram!=='')
        ) ? (
          <View style={styles.uploadSection}>
            <View style={styles.fileCard}>
              <View style={styles.fileHeader}>
                <Icon name="file-document-outline" size={48} color="#1976D2" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {documentation.arc_doc_alu_ram ?? 'Archivo sin nombre'}
                  </Text>
                  {documentation.fec_doc_alu_ram && (
                    <Text style={styles.fileDate}>
                      Entregado: {formatDate(documentation.fec_doc_alu_ram, '/')}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonPrimary]} 
                  onPress={downloadFileFunc}
                  activeOpacity={0.7}
                >
                  <Icon name="download-outline" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Descargar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonDanger]} 
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
  },
  infoBold: {
    fontWeight: '700',
  },
  uploadCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  fileSelectedCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: '#000',
    marginBottom: 2,
  },
  fileSelectedSize: {
    fontSize: 12,
    color: '#666',
  },
  fileCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: '#000',
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#000',
  },
  buttonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  buttonDanger: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default DocumentationDetails;