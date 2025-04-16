import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, useWindowDimensions, TouchableOpacity } from 'react-native';
import endeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { ActividadPendiente } from '../interfaces/appInterfaces';
import { colors, platformTheme } from '../theme/platformTheme';
import { CardActividadPendiente } from './CardActividadPendiente';
import { LoadingScreen } from '../screens/LoadingScreen';

export const ActividadesPendientes = () => {
    const [loadingAct, setLoadingAct] = useState(false);
    const [actividadesPendientes, setActividadesPendientes] = useState([]);
    const { data_alumno } = useContext( AuthContext );
    const [viewContent, setViewContent] = useState(false)
    useEffect(() => {
        getActividadesPendientes();
        return () => {
            
        }
    }, [])
    
    const getActividadesPendientes = async() => {
        setLoadingAct(true);
        const {data} = await endeApi.get(`notificaciones_actividad/${data_alumno?.id_alu}`);
        // console.log(`notificaciones_actividad/${data_alumno?.id_alu}`);
        if(data.trans){
            setActividadesPendientes(data.data);
        }
        setLoadingAct(false);
    }

    const {height} = useWindowDimensions();

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.containerTitleActPend, 
                    {
                        borderBottomStartRadius: viewContent ? 0 : 10,
                        borderBottomEndRadius: viewContent ? 0 : 10,
                    }
                ]}
                activeOpacity={0.9}
                onPress={()=>setViewContent(!viewContent)}
            >
                <Text style={styles.textTitle}>Actividades pendientes</Text>
            </TouchableOpacity>
            <View style={[styles.containerActPend, {height: viewContent ? 'auto' : 0, opacity: viewContent ? 1 : 0}]}>
                {
                    loadingAct ? 
                        <View style={{marginVertical: 20}}>
                            <LoadingScreen text='Cargando actividades pendientes...'/>
                        </View>
                    :
                        actividadesPendientes.length>0 ?
                            actividadesPendientes.map((actividadPendiente:ActividadPendiente)=>
                                <CardActividadPendiente
                                    key={actividadPendiente.id}
                                    actividadPendiente={actividadPendiente}
                                    viewType='normal'
                                />
                            )
                        :
                            <View style={{marginVertical: 20}}>
                                <Text style={{textAlign: 'center', marginHorizontal: 20}}>Actualmente no presenta actividades pendientes</Text>
                            </View>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...platformTheme.shadowBox,
        padding: 10,
    },
    containerTitleActPend: {
        overflow: 'hidden',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        height: 50
    },
    textTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        color: 'white',
        backgroundColor: colors.darkBlue,
    },
    containerActPend: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.darkBlue,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: 'white',
    }
});