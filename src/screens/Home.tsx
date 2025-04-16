import React, {useContext, useState, useEffect } from 'react'
import { Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, Linking } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { WhiteLogo } from '../components/WhiteLogo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import cafeApi from '../api/estudianteAPI';
import PaperMessages from '../components/PaperMessages';
import { colors, platformTheme } from '../theme/platformTheme';
import { ActividadesPendientes } from '../components/ActividadesPendientes';
import { AvisosEstudiante } from '../components/AvisosEstudiante';
import { baseUrlSite } from '../hooks/useGlobal';
// import {requestUserPermission,NotificationListener} from '../utils/pushnotification_helper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { PagosAnticipadosVencidos } from '../components/PagosAnticipadosVencidos';

export const Home = () => {
    const { data_alumno, token, logOut } = useContext( AuthContext );
    const { top } = useSafeAreaInsets();
    const [ refreshing, setRefreshing] = useState(false);
    const [encuestasPendientes, setEncuestasPendientes] = useState([])
    const [tokenOtroUsuario, setTokenOtroUsuario] = useState(false)
    
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            console.log('Terminamos');
            setRefreshing(false);
        }, 1500);
    }

    useEffect(() => {
        validarToken();
        // NotificationListener();
        getEncuestasAlumno();
        return () => {
            setEncuestasPendientes([]);
            setTokenOtroUsuario(false);
        }
    }, [])

    const validarToken = async () => {
        // await requestUserPermission();
        const token = await AsyncStorage.getItem('fcmtoken');
        const {data} = await cafeApi.get('push_notification/validarToken', {params:{token, usuario: data_alumno?.id_alu}});
        if(data.trans && token!==null){
            if(data.otroUsuario){//si fue asignado a otro usuario, se notificara al usuario
                setTokenOtroUsuario(true);
            }else if(!data.miUsuario){//Si no ha sido asignado a otro usuario y no ha sido asignado a mi usuario lo asigno a mi usuario
                await vincularUsuario();
            }
        }
    }

    const getEncuestasAlumno = async () => {
        const {data} = await cafeApi.get(`encuestas/encuestasPendientes/${data_alumno?.id_alu}/${data_alumno?.id_cad1}/${data_alumno?.id_pla8}`);
        if(data.trans){
            setEncuestasPendientes(data.data)
        }
    }

    const vincularUsuario = async (desvincularOtrosUsuarios=false) => {
        const token = await AsyncStorage.getItem('fcmtoken');
        if(token && data_alumno?.id_alu){//Si existe el token ya sea desde el AsyncStorage o generado desde firebase, se asocia al usuario en la base de datos (dispositivo -> usuario)
            const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
            let dataDesv = true;
            if(desvincularOtrosUsuarios){
                const {data} = await cafeApi.post('/push_notification/desvincularUsuariosToken', {token}, headers);//Se quita el token a cualquier usuario que ya lo tenga asignado.
                dataDesv = data.trans;
            }
            if(dataDesv){
                const deviceInfo = {
                    deviceId: await DeviceInfo.getDeviceId(),
                    model: DeviceInfo.getModel(),
                    brand: DeviceInfo.getBrand(),
                    systemName: DeviceInfo.getSystemName(),
                    systemVersion: DeviceInfo.getSystemVersion(),
                    uniqueId: DeviceInfo.getUniqueId(),
                };
                const {data} = await cafeApi.post('/push_notification/vincularUsuarioToken', {token, usuario: data_alumno?.id_alu, deviceInfo: JSON.stringify(deviceInfo)}, headers);//Se quita el token a cualquier usuario que ya lo tenga asignado.
                if(data.trans){
                    setTokenOtroUsuario(false);
                }
            }
            // console.log('Guardar token en la bd');
        }
    }

    return (
        // <ScrollView
        //     style={{
        //         marginTop: refreshing ? top : 0
        //     }}
            // refreshControl={
            //     <RefreshControl 
            //         refreshing={ refreshing }
            //         onRefresh={ onRefresh }
            //         progressViewOffset={ 10 }
            //         progressBackgroundColor="#5856D6"
            //         colors={ ['white','red','orange'] }
            //         // style={{ backgroundColor: '#5856D6' }}
            //         // tintColor="white"
            //     />
            // }
        // >
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* <WhiteLogo /> */}
                <AvisosEstudiante/>
                <ActividadesPendientes/>
                <PagosAnticipadosVencidos/>
            </ScrollView>
            <PaperMessages
                visible={encuestasPendientes.length>0}
                title='Encuestas pendientes'
                message=<Text>
                    Tú opinion es lo más importante para nosotros. Ayúdanos a mejorar la experiencia ENDE.
                    </Text>
                buttonText='Responder encuesta'
                dismissable={true}
                colorTitle={colors.blue}
                colorBody={colors.darkBlue}
                pressButton = { () => {Linking.openURL(baseUrlSite);setEncuestasPendientes([])} }
                btnTxtCancel='AHORA NO'
                evtBtnCancel={() => setEncuestasPendientes([])}
                styleButton={platformTheme.btnBlue}
                styleBtnCancel={platformTheme.btnSilver}
            />
            <PaperMessages
                visible={tokenOtroUsuario}
                title='Dispositivo vinculado a otro usuario'
                message=<Text>
                    Este dispositivo se encuentra asociado a otro usuario, si vincula este usuario a este dispositivo, dejará de recibir notificaciones del otro usuario.
                    </Text>
                buttonText='Vincular este usuario'
                dismissable={true}
                colorTitle={colors.blue}
                colorBody={colors.darkBlue}
                pressButton = { () => vincularUsuario(true) }
                btnTxtCancel='No vincular'
                evtBtnCancel={() => setTokenOtroUsuario(false)}
                styleButton={platformTheme.btnBlue}
                styleBtnCancel={platformTheme.btnSilver}
            />
        </SafeAreaView>
        
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        fontSize: 20,
        marginBottom: 20
    },

    card_1: {
        borderRadius: 20,
        backgroundColor: "#ffffff",
        flex: 1,
        alignItems: 'center',
        padding: 30,
        width: 350,
        margin: 10
        
    }
});