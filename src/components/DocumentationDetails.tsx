import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { FilePick, IntDocumentationCard, PropsDocumentationDetails } from '../interfaces/appInterfaces';
import { BackButtonNavigation } from './BackButtonNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentationCard from './DocumentationCard';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import DocumentPicker from 'react-native-document-picker';
import { useUploads } from '../hooks/useUploads';
import { nombreGuionesMinus } from '../hooks/useFormats';
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
      // User cancelled the picker, exit any dialogs or menus and move on
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
    // console.log(resp);
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

  // Función para eliminar el archivo

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
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={documentation.nom_doc_ram}/>
      <DocumentationCard data_doc={documentation} onPressEvnt={false}/>
      {
        documentation.est_doc_alu_ram === 'Pendiente' ? (
          <View style={styles.uploadContainer}>
            <Text style={styles.validFormatsText}>
              {
                obFile.name !== "" ?
                  <Text>{obFile.name+'  '}<FontAwesome5Icon onPress={() => setObFile(initialStateObFile)} name="times" size={16} color={colors.error} /></Text>
                :
                  <>FORMATOS VÁLIDOS: <Text style={styles.formatTypes}>pdf, jpeg, jpg, png</Text></>
              }
            </Text>

            <View style={styles.iconWrapper}>
              <FontAwesome5Icon name="cloud-upload-alt" size={72} color="#6B7280" />
            </View>

            {
                obFile.name !== "" ?
                  <View style={platformTheme.fila}>
                    <TouchableOpacity activeOpacity={0.7} style={styles.selectFileButton} onPress={uploadFile}>
                      <FontAwesome5Icon name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.selectFileButtonText}>Subir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={styles.cancelUpload} onPress={() => setObFile(initialStateObFile)}>
                      <FontAwesome5Icon name="times" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.selectFileButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                :
                  <TouchableOpacity activeOpacity={0.7} style={styles.selectFileButton} onPress={loadFile}>
                    <FontAwesome5Icon name="file" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.selectFileButtonText}>Seleccionar archivo</Text>
                  </TouchableOpacity>
              }
            
          </View>
        )
        :
        (
          documentation.est_doc_alu_ram === 'Entregado' || 
          (documentation.est_doc_alu_ram === 'Aprobado' && documentation.arc_doc_alu_ram && documentation.arc_doc_alu_ram!=='') )
            ? (
              <View style={styles.uploadContainer}>
                <Text style={styles.validFormatsText}>
                  {documentation.arc_doc_alu_ram ?? 'Archivo sin nombre'}
                </Text>

                <View style={styles.iconWrapper}>
                  <FontAwesome5Icon name="cloud-download-alt" size={72} color="#6B7280" />
                </View>
                <View style={platformTheme.fila}>
                  <TouchableOpacity style={styles.selectFileButton} onPress={downloadFileFunc}>
                    <Text style={styles.selectFileButtonText}>Descargar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteFileButton} onPress={confirmDeleteFile}>
                    <Text style={styles.selectFileButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
      }
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
    backgroundColor: '#f9fafb',
    padding: 5,
  },
  uploadContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  validFormatsText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },

  formatTypes: {
    fontWeight: 'bold',
    color: '#1F2937',
  },

  iconWrapper: {
    marginBottom: 20,
  },

  selectFileButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 10,
  },

  deleteFileButton: {
    flexDirection: 'row',
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  cancelUpload: {
    flexDirection: 'row',
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 10,
  },

  selectFileButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },

  deleteFileButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DocumentationDetails;
