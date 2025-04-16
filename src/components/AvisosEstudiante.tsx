import React, { useContext, useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { colors, platformTheme } from '../theme/platformTheme';
import cafeApi from '../api/estudianteAPI'
import { LoadingScreen } from '../screens/LoadingScreen';
import { AvisoEstudiante } from '../interfaces/appInterfaces';
import { CardAvisoEstudiante } from './CardAvisoEstudiante';
import { AuthContext } from '../context/AuthContext';

export const AvisosEstudiante = () => {
    const { data_alumno } = useContext( AuthContext );
    const [dataAvisos, setDataAvisos] = useState([])
    const [loadingAvi, setLoadingAvi] = useState(false)
    const [viewContent, setViewContent] = useState(true)
    useEffect(() => {
        getAvisos();
        return () => {}
    }, [])

    const getAvisos = async() => {
        setLoadingAvi(true);
        const {data} = await cafeApi.get('/avisos/'+data_alumno?.id_pla8);
        if(data.trans){
            setDataAvisos(data.data);
        }
        setLoadingAvi(false);
        return true;
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.containerTitleAviso, 
                    {
                        borderBottomStartRadius: viewContent ? 0 : 10,
                        borderBottomEndRadius: viewContent ? 0 : 10,
                    }
                ]}
                activeOpacity={0.9}
                onPress={()=>setViewContent(!viewContent)}
            >
                <Text style={styles.textTitle}>Avisos</Text>
            </TouchableOpacity>
            <View style={[styles.containerActPend, {height: viewContent ? 'auto' : 0, opacity: viewContent ? 1 : 0}]}>
                {
                    loadingAvi ? 
                        <View style={{marginVertical: 20}}>
                            <LoadingScreen text='Cargando avisos...'/>
                        </View>
                    :
                        dataAvisos.length>0 ?
                            dataAvisos.map((avisoEstudiante:AvisoEstudiante) =>
                                <CardAvisoEstudiante 
                                    key={avisoEstudiante.id}
                                    avisoEstudiante={avisoEstudiante}
                                />
                            )
                        :
                            <View style={{marginVertical: 20}}>
                                <Text style={{textAlign: 'center', marginHorizontal: 20}}>No hay avisos para mostrar</Text>
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
    containerTitleAviso: {
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
        backgroundColor: 'white'
    }
});
