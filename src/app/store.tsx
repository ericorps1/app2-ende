import { configureStore } from "@reduxjs/toolkit";
import dataChatSlice from "../features/chatBloque/dataChatSlice";
import dataNotificationsSlice from "../features/notifications/dataNotificationsSlice";
import dataPagosSlice from "../features/pagos/dataPagosSlice";

export const store = configureStore({
  reducer: {
    datachat: dataChatSlice,
    datanotifications: dataNotificationsSlice,
    datapagos: dataPagosSlice,
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;