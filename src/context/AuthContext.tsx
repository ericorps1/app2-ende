import React, { createContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, LoginResponse, LoginData } from '../interfaces/appInterfaces';
import { authReducer, AuthState, DataAlumno } from './authReducer';
import endeApi from '../api/estudianteAPI';
import { getSucursalKey } from '../utils/StripePaymentHelper';

type AuthContextProps = {
    errorMessage: string;
    token: string | null;
    data_alumno: DataAlumno | null;
    stripeAccountId: string;
    status: 'checking' | 'authenticated' | 'not-authenticated';
    signIn: ( loginData: LoginData ) => void;
    logOut: () => void;
    removeError: () => void;
    checkToken: () => void;
}

const authInicialState: AuthState = {
    status: 'checking',
    token: null,
    data_alumno: null,
    stripeAccountId: '', 
    errorMessage: ''
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any)=> {

    const [ state, dispatch ] = useReducer( authReducer, authInicialState);

    useEffect(() => {
        checkToken();
    }, [])

    const checkToken = async() => {
        const token = await AsyncStorage.getItem('token');

        // No token, no autenticado
        if ( !token ){
            return dispatch({ type: 'notAuthenticated' })
        }
        
        try{
            // Hay token
            const resp = await endeApi.get('/login/check_token');
            if ( resp.status !== 200 ) {
                return dispatch({ type: 'notAuthenticated' });
            }
            await AsyncStorage.setItem('token', token );
            const id_pla = isNaN(Number(resp.data?.id_pla8)) ? 0 : Number(resp.data?.id_pla8);
            dispatch({ 
                type: 'signIn',
                payload: {
                    token: token,
                    data_alumno: resp.data,
                    stripeAccountId: getSucursalKey(id_pla)
                }
            });
        }catch(err) {
            return dispatch({ type: 'notAuthenticated' });
        }
    }

    const signIn = async({ correo, password }: LoginData ) => {
        try { 
            const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
            const {data} = await endeApi.post<LoginResponse>('/login/authentication/', {username: correo, password }, headers );
            if(data.status){
                const id_pla = isNaN(Number(data?.data?.data_alumno?.id_pla8)) ? 0 : Number(data.data.data_alumno?.id_pla8);
                dispatch({ 
                    type: 'signIn',
                    payload: {
                        token: data.data.login_token,
                        data_alumno: data.data.data_alumno,
                        stripeAccountId: getSucursalKey(id_pla)
                    }
                });
                await AsyncStorage.setItem('token', data.data.login_token );
            }else{
                dispatch({ 
                    type: 'addError', 
                    payload: data.message || 'Información incorrecta'
                })
            }

        } catch (error:any) {
            dispatch({ 
                type: 'addError', 
                payload: error.response.data.msg || 'Información incorrecta'
            })
        }
    };
    
    
    const logOut = async() => {
        await AsyncStorage.removeItem('token');
        dispatch({ type: 'logout' });
    };

    const removeError = () => {
        dispatch({ type: 'removeError' });
    };

    return (
        <AuthContext.Provider value={{
            ...state,
            signIn,
            logOut,
            removeError,
            checkToken,
        }}>
            { children }
        </AuthContext.Provider>
    )

}