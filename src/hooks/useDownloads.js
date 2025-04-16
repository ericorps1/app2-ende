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
} from 'react-native';

// Import RNFetchBlob for the file download
import RNFetchBlob from 'rn-fetch-blob';

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

const downloadFile = (fileUrl,fileName) => {
  
  // Get today's date to add the time suffix in filename
  let date = new Date();
  // File URL which we want to download
  let FILE_URL = fileUrl;    
  // Function to get extention of the file url
  let file_ext = getFileExtention(FILE_URL);
  
  file_ext = '.' + file_ext[0];
  
  // config: To get response by passing the downloading related options
  // fs: Root directory path to download
  const { config, fs } = RNFetchBlob;
  let RootDir = fs.dirs.PictureDir;
  const localFile = fileName 
    ? '/'+fileName 
    : '/file_' + Math.floor(date.getTime() + date.getSeconds() / 2) + file_ext
  let options = {
    fileCache: true,
    addAndroidDownloads: {
      path: RootDir+localFile,
      description: 'Descargando archivo...',
      notification: true,
      // useDownloadManager works with Android only
      useDownloadManager: true,   
    },
  };
  config(options)
    .fetch('GET', FILE_URL)
    .then(res => {
      // Alert after successful downloading
      console.log('res -> ', JSON.stringify(res));
      alert('Archivo guardado exitosamente en '+res.data+'.');
    });
};

const getFileExtention = fileUrl => {
  // To get the file extension
  return /[.]/.exec(fileUrl) ?
            /[^.]+$/.exec(fileUrl) : undefined;
};

export {
  fnDownloadFile
}