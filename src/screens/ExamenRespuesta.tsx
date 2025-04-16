import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { CounterTime } from '../components/CounterTime';
import { obPregunta, obRespuesta, PropsActividad, TypesMsgModalType } from '../interfaces/appInterfaces';
import cafeApi from '../api/estudianteAPI';
import { isEmptyObject } from '../hooks/useValidations';
import { colors, platformTheme } from '../theme/platformTheme';
import StepsPagination from '../components/StepsPagination';
import { PreguntaRespuestas } from '../components/PreguntaRespuestas';
import { AuthContext } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import PaperMessages from '../components/PaperMessages';
import { ModalMessages } from '../components/ModalMessages';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RespPreguntasRespuestas {
    data: {
        trans: boolean;
        msg: string;
        data: {
            preguntas: [obPregunta],
            respuestas: [obRespuesta]
        }
    }
}

export const ExamenRespuesta = ({route,navigation}:PropsActividad) => {
    const { data_alumno } = useContext( AuthContext );
    const [counterTime, setCounterTime] = useState(true);
    const {identificador, identificador_copia, titulo, id_cal_act, int_cal_act, dur_exa, puntaje, readonly} = route.params.data_actividad;
    const [preguntas, setPreguntas] = useState<any>([]);
    const [respuestas, setRespuestas] = useState<any>([]);
    const [loadingResp, setLoadingResp] = useState(false);
    const [finalizarExamenAlert, setFinalizarExamenAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [typeMsgAlert, setTypeMsgAlert] = useState<TypesMsgModalType>('error');
    useEffect(() => {
        getPreguntasRespuestasExamen();
    }, [])

    const getPreguntasRespuestasExamen = async () => {
        const {data}:RespPreguntasRespuestas = await cafeApi.get('/pregunta', {params: {id_exa: identificador, id_alu_ram: data_alumno?.id_alu_ram}});
        if(data.trans){
            setPreguntas(data.data.preguntas);
            setRespuestas(data.data.respuestas);
        }else{
            setPreguntas([]);
            setRespuestas([]);
        }
    }
    // console.log('identificador_copia', identificador_copia);
    // console.log('data_alumno?.id_alu_ram', data_alumno?.id_alu_ram);
    const timeEnd = async() => {
        setCounterTime(false);
        navigation.pop();
    }
    const pressBackExaRes = () => {
        navigation.pop();
        setCounterTime(false);
    }
    const pressResp = async(id_pre:number,id_res:number) => {
        setLoadingResp(true);
        const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
        const {data} = await cafeApi.post('respuesta_alumno/'+id_cal_act,{id_exa_cop: identificador_copia,id_res, id_pre, id_alu_ram: data_alumno?.id_alu_ram}, headers);
        if(data.trans===true){
            // await getPreguntasRespuestasExamen();
            
            const respPre = respuestas.filter((respuesta:obRespuesta) => id_pre===respuesta.id_pre );
            // console.log("resps==>>",resps);
            // console.log(resp);return;
            let TMPResp = respuestas;
            respPre.map((resp:obRespuesta)=>{
                const indexRes = respuestas.findIndex((x:obRespuesta) => resp.id_pre===x.id_pre && resp.id_res===x.id_res );
                if(resp.id_pre===id_pre && resp.id_res===id_res){
                    TMPResp[indexRes].id_pre2 = id_pre;
                    TMPResp[indexRes].id_res1 = id_res;
                }else{
                    TMPResp[indexRes].id_pre2 = null;
                    TMPResp[indexRes].id_res1 = null;
                }
            });
            setRespuestas(TMPResp);
        }else{
            setMessageAlert('Error registrando la respuesta.');
            console.log('Error registrando la respuesta.', data);
        }
        setLoadingResp(false);
    }
    let pagPreguntas:any[] = [];
    let numPre = 1;
    preguntas.map((pregunta:obPregunta) => {
        const respuestasPreg = respuestas.filter((respuestaPreg:obRespuesta) => pregunta.id_pre === respuestaPreg.id_pre)
        pagPreguntas.push(
            <PreguntaRespuestas 
                key={pregunta.id_pre}
                pregunta={pregunta}
                respuestasPreg={respuestasPreg}
                onPressResp={pressResp}
                loadingResp={loadingResp}
                numPre={numPre++}
                readonly={readonly ? true : false}
            />
        )
    })
    return (
        <SafeAreaView style={styles.container}>
            <BackButtonNavigation onPressBack={pressBackExaRes} title={titulo}/>
            {(counterTime && readonly===false) && <CounterTime minutos={dur_exa} onEnd={timeEnd}/>}
            <View style={styles.containerBtnFinalizar}>
                {
                    readonly===false && <TouchableOpacity
                        onPress={()=>setFinalizarExamenAlert(true)}
                        style={styles.btnFinalizar}
                    >
                        <Text style={styles.btnFinalizarTxt}>Finalizar</Text>
                    </TouchableOpacity>
                }
            </View>
            <ScrollView>
                <StepsPagination infoRenderSteps={pagPreguntas}/>
            </ScrollView>
            <PaperMessages 
                buttonText='Finalizar'
                dismissable={true}
                message={'¿Desea finalizar el examen con las preguntas que actualmente ha contestado?'}
                title='¿Finalizar?'
                visible={finalizarExamenAlert}
                pressButton={timeEnd}
                onDismiss={()=>setFinalizarExamenAlert(false)}
            />
            <ModalMessages 
                visible={messageAlert!==''}
                modalText={messageAlert}
                onDismiss={()=>setMessageAlert('')}
                typeMsgModal={typeMsgAlert}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        height: Dimensions.get("window").height
    },
    containerBtnFinalizar: {
        alignItems: 'center'
    },
    btnFinalizar: {
        ...platformTheme.btn,
        ...platformTheme.shadowBox,
        ...platformTheme.btnDanger,
        width: '30%',
        marginVertical: 10,
        borderRadius: 5,
        padding: 10,
    },
    btnFinalizarTxt: {
        textAlign: 'center',
        color: 'white',
    }
});