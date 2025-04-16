import React, { useEffect, useState } from 'react'
import { ActividadData } from '../interfaces/appInterfaces'
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
import { colors, platformTheme } from '../theme/platformTheme';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { formatDateActividades } from '../hooks/useFormats';
import { useIsFocused } from '@react-navigation/core';
import cafeApi from '../api/estudianteAPI';

interface ActividadProps{
    actividad: ActividadData;
    key: number;
    onPress: () => void;
}

export const Actividad = ({actividad,onPress}:ActividadProps) => {
    const [calAct, setCalAct] = useState({pun_cal_act: 0, fec_cal_act: '', int_cal_act: 0});
    const isFocused = useIsFocused();
    useEffect(() => {
        if(isFocused){
            getCalAct();
        }
    }, [isFocused])

    const getCalAct = async() => {
        const {data} = await cafeApi.get('cal_act/'+actividad.id_cal_act);
        if(data.trans){
            setCalAct(data.data[0]);
        }
    }

    let iconName = 'file';
    switch(actividad.tipo){
        case 'Entregable' : iconName = 'file';
        break;
        case 'Examen' : iconName = 'diagnoses';
        break;
        case 'Foro' : iconName = 'comment';
        break;
    }
    let colorStatus = colors.success;
    let statusAct = 'Calificada';
    if(!calAct.fec_cal_act){
        if(actividad.estatus_fecha==='Vencida'){
            colorStatus = colors.error;
            statusAct = 'Vencida'
        }else{
            colorStatus = colors.warning;
            statusAct = 'Pendiente'
        }
    }

    return (
        <TouchableOpacity style={ styles.container } onPress={onPress}>
            <View style={ platformTheme.fila }>
                <View style={styles.iconContainer}>
                    <FontAwesome5Icon name={iconName} style={styles.icon}/>
                    <Text style={ styles.textTipo }>{ actividad.tipo }</Text>
                </View>
                <View style={ styles.titleContainer }>
                    <Text style={styles.title}>{ actividad.titulo }</Text>
                    <View style={ styles.puntosContainer }>
                        <Text style={ styles.textPuntos }>Puntos totales: {actividad.puntaje}</Text>
                        <Text style={ styles.textPuntos }>Puntos obtenidos: {calAct.pun_cal_act ? calAct.pun_cal_act : 'Sin calificación'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.containerPeriodoEnt}>
                <Text style={styles.textPeriodoEnt}>Desde: {formatDateActividades(actividad.inicio)} - Hasta: {formatDateActividades(actividad.fin)}</Text>
            </View>
            <View style={styles.containerEstCal}>
                <Text style={{...styles.textEstCal, backgroundColor: colorStatus}}>{ statusAct }</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        ...platformTheme.shadowBox,
        backgroundColor: colors.softBlue,
        padding: 20,
        borderRadius: 10,
        marginRight: 10,
        marginTop: 10,
    },
    iconContainer:{
        alignItems: 'center',
        justifyContent:'center'
    },
    icon: {
        fontSize: 30,
        color: colors.silver
    },
    textTipo: {
        color: colors.darkBlue,
        fontSize: 20,
    },
    title: {
        fontSize: 25,
        marginLeft: 10,
        color: colors.darkBlue,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    puntosContainer: {
        alignItems: 'center',
        flex: 1,
        width: '100%',
        marginTop: 10
    },
    textPuntos: {
        color: colors.info,
        fontSize: 12
    },
    containerPeriodoEnt: {
        flex: 1,
        marginTop: 10,
        width: '100%',
    },
    textPeriodoEnt: {
        color: colors.darkBlue,
        fontSize: 12,
        textAlign: 'center'
    },
    containerEstCal: {
        flex: 1,
        alignItems: 'flex-end'
    },
    textEstCal: {
        color: 'white',
        textAlign: 'left',
        padding: 3,
        borderRadius: 10,
        fontWeight: 'bold'
    }
});