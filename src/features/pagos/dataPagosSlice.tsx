import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Pagos } from '../../interfaces/appInterfaces';

const initialState: Pagos[] = []

const dataPagosSlice = createSlice({
  name: "datapagos",
  initialState,
  reducers: {
    updateInfoPagos: (state, action: PayloadAction<Pagos[]>) => {
      return action.payload;
    }
  }
})

export const {updateInfoPagos} = dataPagosSlice.actions;
export default dataPagosSlice.reducer;