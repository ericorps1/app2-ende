import React from 'react';

// Import React native Components
import {
  Text,
  View,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  PermissionsAndroid,
  ToastAndroid,
  Alert
} from 'react-native';

// Import RNFetchBlob for the file download
import RNFetchBlob from 'react-native-blob-util';

const fnDownloadFile = async (fileUrl, fileName='') => {
  
  // Function to check the platform
  // If Platform is Android then check for permissions.

  if (Platform.OS === 'ios') {
    downloadFile(fileUrl,fileName);
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,{
          title: 'UPS!, necesitamos permisos.',
          message:
            'Necesitamos acceder a tu sistema de archivos para poder guardar los documentos que descargas.',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Start downloading
        downloadFile(fileUrl,fileName);
        console.log('Storage Permission Granted.');
      } else {
        // If permission denied then show alert
        Alert.alert('Error','No tenemos permiso para acceder a tu sistema de archivos :(');
      }
    } catch (err) {
      // To handle permission related exception
      console.log("++++"+err);
    }
  }
};

const showMessage = (message, isError = false) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert(isError ? 'Error' : 'Éxito', message);
  }
};

const downloadFile = async (fileUrl, fileName) => {
  try {
    // Validar que la URL no esté vacía
    if (!fileUrl || fileUrl.trim() === '') {
      showMessage('La URL del archivo está vacía', true);
      return { success: false, error: 'URL vacía' };
    }

    // Validar formato de URL básico
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
      showMessage('La URL debe comenzar con http:// o https://', true);
      return { success: false, error: 'URL inválida' };
    }

    // Mostrar indicador de inicio de descarga
    showMessage('Iniciando descarga...');

    // Verificar que la URL sea accesible
    try {
      const headResponse = await fetch(fileUrl, { 
        method: 'HEAD',
        timeout: 5000 // 5 segundos timeout
      });
      
      if (!headResponse.ok) {
        throw new Error(`HTTP ${headResponse.status}`);
      }
    } catch (fetchError) {
      showMessage('El archivo es inválido, contacta a tu profesor.', true);
      return { success: false, error: 'URL no accesible' };
    }

    const date = new Date();
    const { config, fs } = RNFetchBlob;
    const RootDir = fs.dirs.DownloadDir; // Cambié a DownloadDir para mejor compatibilidad

    let file_ext = getFileExtention(fileUrl);
    file_ext = file_ext && file_ext[0] ? '.' + file_ext[0] : '.bin';

    const localFile = fileName
      ? '/' + fileName
      : '/file_' + Math.floor(date.getTime() + date.getSeconds() / 2) + file_ext;

    const options = {
      fileCache: true,
      addAndroidDownloads: {
        path: RootDir + localFile,
        description: 'Descargando archivo...',
        notification: true,
        useDownloadManager: true,
        mediaScannable: true, // Para que aparezca en galería si es imagen
      },
    };

    const res = await config(options)
      .fetch('GET', fileUrl)
      .progress((received, total) => {
        const percentage = Math.floor((received / total) * 100);
      });

    // Verificar que el archivo existe
    const fileExists = await fs.exists(res.path());

    if (fileExists) {
      const stats = await fs.stat(res.path());

      showMessage(`Archivo guardado exitosamente`);
      return { 
        success: true, 
        path: res.path(),
        size: stats.size 
      };
    } else {
      throw new Error('El archivo no se guardó correctamente');
    }

  } catch (error) {
    console.error('Error completo en descarga:', error);

    let errorMessage = 'Error al descargar el archivo';

    if (error.message?.includes('Network request failed')) {
      errorMessage = 'Sin conexión a internet';
    } else if (error.message?.includes('404')) {
      errorMessage = 'Archivo no encontrado (404)';
    } else if (error.message?.includes('403')) {
      errorMessage = 'Acceso denegado (403)';
    } else if (error.message?.includes('500')) {
      errorMessage = 'Error del servidor (500)';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Tiempo de espera agotado';
    } else if (error.message?.includes('ENOENT')) {
      errorMessage = 'Error al guardar el archivo';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showMessage(errorMessage, true);
    return { success: false, error: errorMessage };
  }
};

// Función auxiliar mejorada para obtener extensión
const getFileExtention = (url) => {
  try {
    // Eliminar query params y fragmentos
    const cleanUrl = url.split('?')[0].split('#')[0];
    const extension = cleanUrl.split('.').pop().toLowerCase();
    return [extension];
  } catch (error) {
    console.error('Error obteniendo extensión:', error);
    return ['bin']; // Extensión por defecto
  }
};
export {
  fnDownloadFile
}