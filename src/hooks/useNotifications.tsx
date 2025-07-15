import endeApi from "../api/estudianteAPI";
import { useAppDispatch } from "../app/hooks";
import { addNotifications } from "../features/notifications/dataNotificationsSlice";

export const updateNotifications = async (id_alu: any) => {
  const dispatch = useAppDispatch();
  const {data} = await endeApi.get(`notificaciones/${id_alu}`);
    if(data.trans){
      if(data.data.length > 0){
        dispatch(addNotifications(data.data))
      }
    }
}