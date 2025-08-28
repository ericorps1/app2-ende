import endeApi from "../api/estudianteAPI";
import { useAppDispatch } from "../app/hooks";
import { addNotifications } from "../features/notifications/dataNotificationsSlice";
import DeviceInfo from 'react-native-device-info';

export const updateNotifications = async (id_alu: any) => {
  const dispatch = useAppDispatch();
  const {data} = await endeApi.get(`notificaciones/${id_alu}`);
    if(data.trans){
      if(data.data.length > 0){
        dispatch(addNotifications(data.data))
      }
    }
}

export const vincularTokenUsuario = async (token: string, id_alu: any) => {
  const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
  const deviceInfo = {
    deviceId: await DeviceInfo.getDeviceId(),
    model: DeviceInfo.getModel(),
    brand: DeviceInfo.getBrand(),
    systemName: DeviceInfo.getSystemName(),
    systemVersion: DeviceInfo.getSystemVersion(),
    uniqueId: DeviceInfo.getUniqueId(),
  };
  await endeApi.post('/push_notification/vincularUsuarioToken', {token, usuario: id_alu, deviceInfo: JSON.stringify(deviceInfo)}, headers);//Se quita el token a cualquier usuario que ya lo tenga asignado.
}