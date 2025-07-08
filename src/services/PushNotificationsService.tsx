import endeApi from "../api/estudianteAPI";
import { StatusNotificationType } from "../interfaces/appInterfaces";

export const updateStatusNotificationService = async (notificationId: any, est_not: StatusNotificationType) => {
  try {
    const config = {headers:{ 'Content-Type':'text/plain' }};
    const {data} = await endeApi.put('/push_notification/changeStatus/'+notificationId, JSON.stringify({est_not}), config);
    return data.trans;
  } catch (error) {
    console.error('Error al actualizar el estado de la notificación:', error);
    return false;
  }
}

export const getNotificationsService = async(id_alu: string|number|null|undefined) => {
  try {
    const {data} = await endeApi.get(`notificaciones/${id_alu}`);
    if(data.trans){
      if(data.data.length > 0){
        return data.data;
      }
    }
    return [];
  } catch (error) {
    console.error('Error al obtener las notificaciones:', error);
    return [];
  }
} 