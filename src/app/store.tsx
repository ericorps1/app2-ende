import { configureStore } from "@reduxjs/toolkit";
import dataChatSlice from "../features/chatBloque/dataChatSlice";
// import userdataSlice from '../features/dataLogin/userdataSlice';

export const store = configureStore({
    reducer: {
        datachat: dataChatSlice
    }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>