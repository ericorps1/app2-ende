import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface dataChatState {
    id_pro: number;
    id_emp: number;
    nom_pro: string;
    fot_emp: string;
    tipo: string;
    id_sub_hor: number;
    materia: string;
}

const initialState:dataChatState = {
    id_pro: 0,
    id_emp: 0,
    nom_pro: '',
    fot_emp: '',
    tipo: '',
    id_sub_hor: 0,
    materia: ''
}

const dataChatState = createSlice({
    name: "datachat",
    initialState,
    reducers: {
        updateInfo: (state, action:PayloadAction<dataChatState>) => {
            state.id_pro = action.payload.id_pro;
            state.id_emp = action.payload.id_emp;
            state.nom_pro = action.payload.nom_pro;
            state.fot_emp = action.payload.fot_emp;
            state.tipo = action.payload.tipo;
            state.id_sub_hor = action.payload.id_sub_hor;
            state.materia = action.payload.materia;
        }
    }
})

export const {updateInfo} = dataChatState.actions;
export default dataChatState.reducer;