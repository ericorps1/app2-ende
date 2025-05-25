import { configureStore } from "@reduxjs/toolkit";
import dataChatSlice from "../features/chatBloque/dataChatSlice";
import dataNotificationsSlice from "../features/notifications/dataNotificationsSlice";

export const store = configureStore({
  reducer: {
    datachat: dataChatSlice,
    datanotifications: dataNotificationsSlice
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;