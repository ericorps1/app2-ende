import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CounterTime } from '../components/CounterTime';
import { obPregunta, obRespuesta, PropsActividad, TypesMsgModalType } from '../interfaces/appInterfaces';
import cafeApi from '../api/estudianteAPI';
import { colors, platformTheme } from '../theme/platformTheme';
import StepsPagination from '../components/StepsPagination';
import { PreguntaRespuestas } from '../components/PreguntaRespuestas';
import { AuthContext } from '../context/AuthContext';
import PaperMessages from '../components/PaperMessages';
import { ModalMessages } from '../components/ModalMessages';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  const timeEnd = async() => {
    setCounterTime(false);
    navigation.pop();
  }

  const pressBackExaRes = () => {
    navigation.pop();
    setCounterTime(false);
  }

  const pressResp = (id_pre:number, id_res:number) => {
    const respPre = respuestas.filter((respuesta:obRespuesta) => id_pre===respuesta.id_pre );
    let TMPResp = [...respuestas];
    respPre.forEach((resp:obRespuesta)=>{
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
  }

  const guardarRespuestas = async () => {
    setLoadingResp(true);
    const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
    
    const respuestasSeleccionadas = respuestas.filter((r: obRespuesta) => r.id_pre2 && r.id_res1);

    try {
      for (const respuesta of respuestasSeleccionadas) {
        await cafeApi.post('respuesta_alumno/'+id_cal_act, {
          id_exa_cop: identificador_copia,
          id_res: respuesta.id_res,
          id_pre: respuesta.id_pre,
          id_alu_ram: data_alumno?.id_alu_ram
        }, headers);
      }
      timeEnd();
    } catch (error) {
      setMessageAlert('Error guardando las respuestas.');
      setLoadingResp(false);
    }
  }

  let pagPreguntas:any[] = [];
  let numPre = 1;
  const totalPreguntas = preguntas.length;
  preguntas.map((pregunta:obPregunta) => {
      const respuestasPreg = respuestas.filter((respuestaPreg:obRespuesta) => pregunta.id_pre === respuestaPreg.id_pre)
      pagPreguntas.push(
        <PreguntaRespuestas 
          key={pregunta.id_pre}
          pregunta={pregunta}
          respuestasPreg={respuestasPreg}
          onPressResp={pressResp}
          loadingResp={loadingResp}
          numPre={numPre}
          totalPreguntas={totalPreguntas}
          readonly={readonly ? true : false}
        />
      )
      numPre++;
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={pressBackExaRes} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{titulo}</Text>
          <Text style={styles.headerSubtitle}>
            {readonly ? 'Revisión' : 'En progreso'}
          </Text>
        </View>
        {!readonly && (
          <TouchableOpacity 
            onPress={() => setFinalizarExamenAlert(true)}
            style={styles.finishButton}
            activeOpacity={0.7}
          >
            <Text style={styles.finishButtonText}>Finalizar</Text>
          </TouchableOpacity>
        )}
      </View>

      {(counterTime && readonly === false) && (
        <View style={styles.timerContainer}>
          <CounterTime minutos={dur_exa} onEnd={timeEnd}/>
        </View>
      )}

      <StepsPagination infoRenderSteps={pagPreguntas}/>

      <PaperMessages 
        buttonText='Finalizar'
        dismissable={true}
        message={'¿Desea finalizar el examen? Se guardarán todas las respuestas seleccionadas.'}
        title='¿Finalizar?'
        visible={finalizarExamenAlert}
        pressButton={guardarRespuestas}
        onDismiss={() => setFinalizarExamenAlert(false)}
      />
      <ModalMessages 
        visible={messageAlert !== ''}
        modalText={messageAlert}
        onDismiss={() => setMessageAlert('')}
        typeMsgModal={typeMsgAlert}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  finishButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timerContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
});