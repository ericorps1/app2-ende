import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import endeApi from '../api/estudianteAPI';
import { updateStatusNotificationService } from '../services/PushNotificationsService';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    await GetFCMToken();
  }
}

async function GetFCMToken(){
  let fcmtoken = await AsyncStorage.getItem('fcmtoken');
  console.log(fcmtoken, 'old token');
  if(!fcmtoken){
    try {
      fcmtoken= await messaging().getToken();
      console.log(fcmtoken,'Token generado desde firebase');
      if(fcmtoken){
        await AsyncStorage.setItem('fcmtoken', fcmtoken);
      }
    } catch (error) {
      console.log(error, 'Error tratando de capturar el token de notificaciones');    
    }
  }
}

export const NotificationListener = () => {
  // Los listeners se configuran ahora en Home.tsx usando los hooks de Firebase
  console.log('Notification listeners configurados');
}