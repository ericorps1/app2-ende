import { Usuario } from '../interfaces/appInterfaces';

export interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    token: string | null;
    errorMessage: string;
    data_alumno: DataAlumno | null;
}

export interface DataAlumno {
    id_cit1: null | number | string;
    id_eje3: null | number | string;
    id_pla8: null | number | string;
    id_ram3: null | number | string;
    id_alu1: null | number | string;
    id_gen1: null | number | string;
    id_alu_ram: null | number | string;
    id_cad1: null | number | string;
    id_alu: null | number | string;
    ing_alu: null | string;
    fot_alu: null | string;
    nom_alu: null | string;
    bol_alu: null | number | string;
    tel_alu: null | number | string;
    cor_alu: null | string;
    pas_alu: null | string;
    nom_gen: null | string;
    nom_ram: null | string;
    ini_gen: null | string;
    fin_gen: null | string;
    est_alu: null | string;
    est1_alu_ram: null | string;
    com_ram: null | number | string;
    cur_alu: null | string;
    tel2_alu: null | number | string;
    estatus_general: null | string;
    estatus_pago: null | string;
    estatus_academico: null | string;
    meses_adeudo: null | string;
    adeudo_alumno: null | string;
    pagado_alumno: null | string;
    estatus_presentacion: null | string;
    estatus_actividad: null | string;
    estatus_documentacion: null | string;
    estatus_documentacion2: null | string;
    carga_alumno: null | number | string;
}

type AuthAction = 
    | { type: 'signIn', payload: { token: string, data_alumno: DataAlumno | null} }
    | { type: 'addError', payload: string }
    | { type: 'removeError' }
    | { type: 'notAuthenticated' }
    | { type: 'logout' }


export const authReducer = ( state: AuthState, action: AuthAction ): AuthState => {

    switch (action.type) {
        case 'addError':
            return {
                ...state,
                data_alumno: null,
                status: 'not-authenticated',
                token: null,
                errorMessage: action.payload
            }
    
        case 'removeError':
            return {
                ...state,
                errorMessage: ''
            };

        case 'signIn':
            return {
                ...state,
                errorMessage: '',
                status: 'authenticated',
                token: action.payload.token,
                data_alumno: action.payload.data_alumno
            }

        case 'logout':
        case 'notAuthenticated':
            return {
                ...state,
                status: 'not-authenticated',
                token: null,
                data_alumno: null
            }

        default:
            return state;
    }


}