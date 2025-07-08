import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '../../interfaces/appInterfaces';

const initialState: Notification[] = []

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