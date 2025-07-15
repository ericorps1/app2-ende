import { PermissionsAndroid, Platform } from 'react-native';

export const requestCameraPermission = async (title='Permiso para usar la cámara', message='La aplicación necesita acceso a tu cámara') => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title,
        message,
        buttonPositive: "Aceptar",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}
