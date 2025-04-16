import React, { useContext, useEffect, useState } from 'react'
import { View, SafeAreaView, ScrollView, StyleSheet, Text, TouchableHighlight, Dimensions } from 'react-native';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { AuthContext } from '../context/AuthContext';
import { PropsActividad } from '../interfaces/appInterfaces';
import { colors, platformTheme } from '../theme/platformTheme';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { Button, Divider } from 'react-native-paper';
import PaperMessages from '../components/PaperMessages';
import cafeApi from '../api/estudianteAPI';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/core';
import { ChatAlumno } from '../components/ChatAlumno';

export const Examen = ({route,navigation}:PropsActividad) => {
    const { data_alumno } = useContext( AuthContext );
    const {identificador_copia, titulo,descripcion,dur_exa,id_cal_act,inicio,fin,puntaje,estatus_fecha} = route.params.data_actividad;
    const [calAct, setCalAct] = useState({pun_cal_act: 0, fec_cal_act: '', int_cal_act: 0});
    const [visibleAlertInicExa, setVisibleAlertInicExa] = useState(false);
    const [visibleAlertFinExamen, setVisibleAlertFinExamen] = useState(false);
    const [visibleAlertNoIntentos, setVisibleAlertNoIntentos] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if(isFocused){
            getIntentos();
        }
    }, [isFocused])
    
    const getIntentos = async() => {
        const {data} = await cafeApi.get('cal_act/'+id_cal_act);
        if(data.trans){
            setCalAct(data.data[0]);
        }
    }

    const iniciarExamen = async () => {
        const config = {headers:{ 'Content-Type':'text/plain' }};
        const {data} = await cafeApi.put('cal_act/'+id_cal_act,JSON.stringify({int_cal_act: calAct.int_cal_act-1, fec_cal_act: 'now'}),config);
        const cleanResp = await cafeApi.post('respuesta_alumno/limpiarrespuestas/'+id_cal_act+'/'+identificador_copia+'/'+data_alumno?.id_alu_ram);
        if(data.trans && cleanResp.data.trans){
            await getIntentos();
            setVisibleAlertInicExa(false);
            navigation.navigate('ExamenRespuesta', {data_actividad: {...route.params.data_actividad, readonly: false}})
        }
    }

    const nuevoIntentoExamen = () => {
        if(calAct.int_cal_act>0){
            setVisibleAlertInicExa(true)
        }else{
            setVisibleAlertNoIntentos(true);
        }
    }

    let colorStatus = colors.success;
    let statusAct = 'Calificada';
    if(!calAct.fec_cal_act){
        if(estatus_fecha==='Vencida'){
            colorStatus = colors.error;
            statusAct = 'Vencida'
        }else{
            colorStatus = colors.warning;
            statusAct = 'Pendiente'
        }
    }


    const finalizarExamen = async() => {
        const config = {headers:{ 'Content-Type':'text/plain' }};
        const {data} = await cafeApi.put('cal_act/'+id_cal_act,JSON.stringify({int_cal_act: 0}),config);
        if(data.trans){
            getIntentos();
        }
        setVisibleAlertFinExamen(false);
    }

    const verResultadoExamen = () => {
        navigation.navigate('ExamenRespuesta', {data_actividad: {...route.params.data_actividad, readonly: true}})
    }
    return (
        <SafeAreaView style={ styles.container }>
            <BackButtonNavigation onPressBack={() => navigation.pop()} title={titulo}/>
            <ScrollView style={{marginBottom: 50, height: Dimensions.get("window").height}}>
                <View style={ styles.bodyExaDetalle }>
                    <View style={ styles.containterDetailExa }>
                        <View style={ platformTheme.fila }>
                            <TouchableHighlight style={ styles.detailExaContainer }>
                                <Text style={ styles.detailExaText }>
                                    <Text style={ styles.titleDetailExaText }>Puntos</Text>
                                    {'\n'+puntaje}
                                </Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={ styles.detailExaContainer }>
                                <Text style={ styles.detailExaText }>
                                    <Text style={ styles.titleDetailExaText }>Inicio</Text>
                                    {'\n'+moment(inicio, 'YYYY-MM-DD', true).format('DD/MMM/YYYY')}
                                </Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={ styles.detailExaContainer }>
                                <Text style={ styles.detailExaText }>
                                    <Text style={ styles.titleDetailExaText }>Fin</Text>
                                    {'\n'+moment(fin, 'YYYY-MM-DD', true).format('DD/MMM/YYYY')}
                                </Text>
                            </TouchableHighlight>
                        </View>
                        <View style={ platformTheme.fila }>
                            <TouchableHighlight style={ styles.detailExaContainer }>
                                <Text style={ styles.detailExaText }>
                                    <Text style={ styles.titleDetailExaText }>Puntos obtenidos</Text>
                                    {'\n'}{(calAct.pun_cal_act) ? calAct.pun_cal_act : 'Sin calificación'}
                                </Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={ styles.detailExaContainer }>
                                <Text style={ styles.detailExaText }>
                                    <Text style={ styles.titleDetailExaText }>Fecha de finalización</Text>
                                    {'\n'}{(calAct.fec_cal_act) ? moment(calAct.fec_cal_act, 'YYYY-MM-DD H:mm:ss', true).format('DD/MMM/YYYY h:mm:ss a') : 'Pendiente'}
                                </Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={ styles.detailExaContainer }>
                                <Text style={ styles.detailExaText }>
                                    <Text style={ styles.titleDetailExaText }>Estatus</Text>
                                    <Text style={ { color: colorStatus } }>{'\n'+statusAct}</Text>
                                </Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                    <View style={ [styles.exaPregunta,platformTheme.shadowBox] }>
                        <HtmlToJsx strHtml={descripcion} />
                        {//Si el estado de la actividad es calificada y aun tiene intentos, se le muestra su calificación y la opción finalizar la actividad
                            (statusAct==='Calificada' && calAct.int_cal_act>0) &&
                            <View style={styles.containerExaCalificado}>
                                <Text style={styles.textExaCalificado}>
                                    Tu calificación fue de {calAct.pun_cal_act} de {puntaje}, te recordamos que puedes intentarlo de nuevo, haciendo click en "INICIAR EXAMEN".
                                </Text>
                                <Text style={styles.textExaCalificado}>
                                    Te restan {calAct.int_cal_act} intentos. Pero puedes conservar tus resultados haciendo click en este botón:
                                </Text>
                                <Button
                                    icon='clock-end'
                                    style={[platformTheme.btn,platformTheme.btnSuccess,platformTheme.shadowBox,{marginTop: 10}]}
                                    color='white'
                                    onPress={()=>setVisibleAlertFinExamen(true)}
                                >FINALIZAR</Button>
                            </View>
                        }
                        <View style={styles.containerInfoExa}>
                            <Text style={styles.msgDurAct}>
                                Tiempo total: <Text style={styles.txtDurAct}>{dur_exa}</Text> minutos.
                            </Text>
                            <Text style={styles.msgDurAct}>
                                Intentos: <Text style={styles.txtDurAct}>{calAct.int_cal_act}</Text> disponibles.
                            </Text>
                        </View>
                        {
                            calAct.int_cal_act>0 ?
                                <>
                                    <View style={styles.containerMsgWarning}>
                                        <Text style={styles.txtMsgWarning}>NOTA: Tenga en cuenta que si cierra la aplicación, cambia de ventana en el dispositivo, minimiza la aplicación, tendrá que volver a empezar el examen y se descontará 1 intento en el total de intentos de este examen, por favor, cuando inicie el examen, permanezca dentro de la aplicación hasta que culmine.</Text>
                                    </View>
                                    <Button
                                        icon='file-document-edit'
                                        style={[platformTheme.btn,platformTheme.btnDarkBlue,platformTheme.shadowBox,{marginTop: 10}]}
                                        textColor='white'
                                        onPress={nuevoIntentoExamen}
                                    >INICIAR EXAMEN</Button>
                                </>
                            :
                                <View>
                                    <Button
                                        icon='file-document-edit'
                                        style={[platformTheme.btn,platformTheme.btnDarkBlue,platformTheme.shadowBox,{marginTop: 10}]}
                                        textColor='white'
                                        onPress={verResultadoExamen}
                                    >VER RESULTADO</Button>
                                </View>

                        }
                    </View>
                </View>
            </ScrollView>
            <View style={{paddingLeft: 20}}>
                <ChatAlumno/>
            </View>
            <PaperMessages 
                buttonText='Iniciar'
                dismissable={true}
                message={'Al iniciar el examen se le descontará 1 intento del total de intentos.\nIntentos disponibles: '+calAct.int_cal_act}
                title='¿INICIAR EXAMEN?'
                visible={visibleAlertInicExa}
                pressButton={iniciarExamen}
                onDismiss={()=>setVisibleAlertInicExa(false)}
            />
            <PaperMessages
                 buttonText='Cerrar'
                 dismissable={true}
                 message={'Usted no posee mas intentos disponibles para este examen.\nIntentos disponibles: '+calAct.int_cal_act}
                 title='¡SIN INTENTOS!'
                 visible={visibleAlertNoIntentos}
                 pressButton={()=>setVisibleAlertNoIntentos(false)}
                 onDismiss={()=>setVisibleAlertNoIntentos(false)}
                 colorTitle={colors.danger}
                 styleButton={platformTheme.btnDanger}
            />
            <PaperMessages 
                buttonText='Finalizar'
                dismissable={true}
                message='Al finalizar el examen no podrás volverlo a intentar y se guardará tu nota definitiva.'
                title='¿FINALIZAR EXAMEN?'
                visible={visibleAlertFinExamen}
                pressButton={finalizarExamen}
                onDismiss={()=>setVisibleAlertFinExamen(false)}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginLeft: 20,
        flex: 1,
    },
    bodyExaDetalle: { 
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 50,
        marginTop: 20,
    },
    exaPregunta: {
        backgroundColor: colors.softSilver,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginRight: 20,
        marginLeft: 1,
        borderRadius: 10
    },
    containterDetailExa: {
        ...platformTheme.shadowBox,
        backgroundColor: colors.softSilver,
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginRight: 20,
        marginLeft: 1,
        borderRadius: 10,
        marginVertical: 20,
    },
    detailExaContainer: {
        flex: 1,
        borderRadius: 10,
        margin: 3,
        borderWidth: 1,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
        color: colors.darkBlue,
        fontSize: 14
    },
    detailExaText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        flex: 1,
    },
    titleDetailExaText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: colors.darkSilver,
    },
    containerExaCalificado: {
        borderBottomWidth: 1,
        borderColor: colors.softBlue
    },
    textExaCalificado: {
        fontSize: 20,
        color: colors.darkBlue,
        textAlign: 'center',
        marginBottom: 10
    },
    containerInfoExa:{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: colors.softBlue,
        marginBottom: 10,
    },
    msgDurAct: {
        fontSize: 20,
        textAlign: 'center',
        color: colors.darkBlue
    },
    txtDurAct: {
        color: colors.danger,
        fontSize: 25,
        fontWeight: 'bold',
    },
    containerMsgWarning: {
        ...platformTheme.shadowBox,
        flex: 1,
        borderRadius: 10,
        backgroundColor: colors.softBlue,
        padding: 10,
    },
    txtMsgWarning: {
        color: colors.darkBlue,
        textAlign: 'justify',
        fontSize: 20,
    }
});