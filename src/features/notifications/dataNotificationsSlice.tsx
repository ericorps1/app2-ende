import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '../../interfaces/appInterfaces';

const initialState: Notification[] = [{
  id_not: 0,
  tit_not: '',
  men_not: '',
  fec_not: '',
  id_eje: 0,
  id_alu_token: 0, 
  est_not: 'Pendiente',
  firebase_response: '',
}]

const dataNotificationsState = createSlice({
  name: "datanotification",
  initialState,
  reducers: {
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      return action.payload;
    }
  }
})

export const {addNotifications} = dataNotificationsState.actions;
export default dataNotificationsState.reducer;