import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
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
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { theme, colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { data_alumno } = useContext( AuthContext );
  
  const [counterTime, setCounterTime] = useState(true);
  const {identificador, identificador_copia, titulo, id_cal_act, int_cal_act, dur_exa, puntaje, readonly} = route.params.data_actividad;
  const [preguntas, setPreguntas] = useState<any>([]);
  const [respuestas, setRespuestas] = useState<any>([]);
  const [loadingResp, setLoadingResp] = useState(false);
  const [finalizarExamenAlert, setFinalizarExamenAlert] = useState(false);
  const [messageAlert, setMessageAlert] = useState('');
  const [typeMsgAlert, setTypeMsgAlert] = useState<TypesMsgModalType>('error');
  const [timerPercentage, setTimerPercentage] = useState(100);
  
  const isDarkTheme = theme === 'dark' || colorScheme === 'dark';
  
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

  const pressResp = useCallback((id_pre: number, id_res: number) => {
    setRespuestas((prevRespuestas: obRespuesta[]) => {
      return prevRespuestas.map((resp: obRespuesta) => {
        if (resp.id_pre !== id_pre) return resp;
        
        if (resp.id_res === id_res) {
          return {
            ...resp,
            id_pre2: id_pre,
            id_res1: id_res
          };
        } else {
          return {
            ...resp,
            id_pre2: null,
            id_res1: null
          };
        }
      });
    });
  }, []);

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

  const preguntasContestadas = useMemo(() => {
    return preguntas.filter((pregunta: obPregunta) => {
      return respuestas.some((resp: obRespuesta) => 
        resp.id_pre === pregunta.id_pre && resp.id_pre2 !== null
      );
    }).length;
  }, [respuestas, preguntas]);

  const pagPreguntas = useMemo(() => {
    const totalPreguntas = preguntas.length;
    return preguntas.map((pregunta: obPregunta, index: number) => {
      const respuestasPreg = respuestas.filter((respuestaPreg: obRespuesta) => 
        pregunta.id_pre === respuestaPreg.id_pre
      );
      
      return (
        <PreguntaRespuestas 
          key={pregunta.id_pre}
          pregunta={pregunta}
          respuestasPreg={respuestasPreg}
          onPressResp={pressResp}
          loadingResp={loadingResp}
          numPre={index + 1}
          totalPreguntas={totalPreguntas}
          readonly={readonly ? true : false}
        />
      );
    });
  }, [preguntas, respuestas, loadingResp, readonly, pressResp]);

  const totalPreguntas = preguntas.length;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* HEADER */}
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + 20,
          backgroundColor: themeColors.backgroundCard,
          borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
        }
      ]}>
        <TouchableOpacity 
          onPress={pressBackExaRes} 
          style={[
            styles.backButton, 
            { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
          ]}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {titulo}
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            {readonly ? 'Revisión' : 'En progreso'}
          </Text>
        </View>
        
        {!readonly && (
          <TouchableOpacity 
            onPress={() => setFinalizarExamenAlert(true)}
            style={[
              styles.finishButton,
              { backgroundColor: isDarkTheme ? '#382E2D' : '#FF3B30' }
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.finishButtonText,
              { color: isDarkTheme ? '#D0A8A0' : '#FFF' }
            ]}>
              Finalizar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PREGUNTAS */}
      <StepsPagination infoRenderSteps={pagPreguntas}/>

      {/* FOOTER FIXED - TIMER + PROGRESS BAR */}
      {!readonly && (
        <View style={[
          styles.progressFooter,
          { 
            paddingBottom: Math.max(insets.bottom, 16) + 16, // 🔥 MUCHO MÁS AIRE: mínimo 16px + 16px extra
            backgroundColor: themeColors.backgroundCard,
            borderTopColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
          }
        ]}>
          {/* TIMER - ARRIBA, CENTRADO */}
          {counterTime && (
            <View style={styles.timerSection}>
              <Icon name="clock-outline" size={18} color={timerPercentage > 50 ? '#34C759' : timerPercentage > 20 ? '#FF9500' : '#FF3B30'} />
              <CounterTime 
                minutos={dur_exa} 
                onEnd={timeEnd}
                onTimeUpdate={(percentage) => setTimerPercentage(percentage)}
              />
            </View>
          )}

          {/* SEPARADOR */}
          <View style={[
            styles.divider,
            { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : '#E0E0E0' }
          ]} />

          {/* PROGRESS BAR - ABAJO */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                {preguntasContestadas}/{totalPreguntas}
              </Text>
              <Text style={[styles.progressPercentage, { color: themeColors.textTertiary }]}>
                {totalPreguntas > 0 ? Math.round((preguntasContestadas / totalPreguntas) * 100) : 0}%
              </Text>
            </View>
            
            <View style={[
              styles.progressBarContainer,
              { backgroundColor: isDarkTheme ? '#2A2A2A' : '#E0E0E0' }
            ]}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: totalPreguntas > 0 ? `${(preguntasContestadas / totalPreguntas) * 100}%` : '0%',
                    backgroundColor: isDarkTheme ? '#1976D2' : '#2196F3'
                  }
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* MODALES */}
      <PaperMessages 
        visible={finalizarExamenAlert}
        onDismiss={() => setFinalizarExamenAlert(false)}
        title='¿Finalizar?'
        message='¿Desea finalizar el examen? Se guardarán todas las respuestas seleccionadas.'
        buttonText='Finalizar'
        pressButton={guardarRespuestas}
        btnTxtCancel='Cancelar'
        evtBtnCancel={() => setFinalizarExamenAlert(false)}
        loading={loadingResp}
        dismissable={true}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  finishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    // 🔥 paddingBottom ahora es dinámico arriba con Math.max
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  progressSection: {
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 11,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});