import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { obPregunta, obRespuesta } from '../interfaces/appInterfaces';
import { colors } from '../theme/platformTheme';
import { HtmlToJsx } from './HtmlToJsx';

interface PropsPreguntaRespuestas {
  pregunta: obPregunta;
  respuestasPreg: [obRespuesta];
  onPressResp: (id_pre: number, id_res: number) => void;
  loadingResp: boolean;
  numPre: number;
  totalPreguntas: number;
  readonly: boolean;
}

export const PreguntaRespuestas = ({
  pregunta,
  respuestasPreg,
  onPressResp,
  loadingResp,
  numPre,
  totalPreguntas,
  readonly,
}: PropsPreguntaRespuestas) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Pregunta {numPre} de {totalPreguntas}</Text>
        </View>

        <View style={styles.questionContent}>
          <HtmlToJsx strHtml={pregunta.pre_pre} styles={`font-size: 16px; color: #000;`} />
        </View>

        <View style={styles.answersContainer}>
          {respuestasPreg.length > 0 &&
            respuestasPreg.map((respuesta: obRespuesta) => {
              const esSeleccionada = respuesta.id_pre2 === respuesta.id_pre && respuesta.id_res === respuesta.id_res1;
              let backgroundColor = '#FFF';
              let borderColor = '#E0E0E0';
              let textColor = '#000';
              let icon = null;

              if (readonly && esSeleccionada) {
                const esCorrecta = respuesta.val_res === 'Verdadero';
                backgroundColor = esCorrecta ? '#E8F5E9' : '#FFEBEE';
                borderColor = esCorrecta ? '#4CAF50' : '#F44336';
                textColor = esCorrecta ? '#1B5E20' : '#B71C1C';
                icon = (
                  <Icon
                    name={esCorrecta ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={esCorrecta ? '#4CAF50' : '#F44336'}
                  />
                );
              } else if (esSeleccionada) {
                backgroundColor = '#000';
                borderColor = '#000';
                textColor = '#FFF';
                icon = <Icon name="radiobox-marked" size={20} color="#FFF" />;
              }

              return (
                <TouchableOpacity
                  key={respuesta.id_res}
                  style={[
                    styles.answerButton,
                    { 
                      backgroundColor,
                      borderColor,
                      opacity: loadingResp ? 0.6 : 1,
                    }
                  ]}
                  activeOpacity={0.7}
                  disabled={readonly || loadingResp}
                  onPress={() => {
                    if (!readonly) onPressResp(respuesta.id_pre, respuesta.id_res);
                  }}
                >
                  <View style={styles.answerContent}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <View style={styles.answerTextContainer}>
                      <HtmlToJsx 
                        strHtml={respuesta.res_res} 
                        styles={`color: ${textColor}; font-size: 15px;`} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  questionContent: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  answersContainer: {
    gap: 10,
  },
  answerButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    marginRight: 2,
  },
  answerTextContainer: {
    flex: 1,
  },
});