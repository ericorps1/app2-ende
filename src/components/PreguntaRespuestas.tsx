import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { obPregunta, obRespuesta } from '../interfaces/appInterfaces';
import { colors } from '../theme/platformTheme';
import { HtmlToJsx } from './HtmlToJsx';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
  
  const isDarkTheme = theme === 'dark' || colorScheme === 'dark';
  
  // console.log('🌓 PREGUNTA_RESPUESTAS - isDarkTheme:', isDarkTheme);
  // console.log('🎨 PREGUNTA_RESPUESTAS - backgroundCard:', themeColors.backgroundCard);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[
        styles.card, 
        { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
        }
      ]}>
        {/* QUESTION HEADER */}
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: themeColors.textPrimary }]}>
            Pregunta {numPre} de {totalPreguntas}
          </Text>
        </View>

        {/* QUESTION CONTENT */}
        <View style={styles.questionContent}>
          <HtmlToJsx 
            strHtml={pregunta.pre_pre} 
            styles={`font-size: 16px; color: ${isDarkTheme ? '#e0e0e0' : '#000'}; font-weight: 500;`}
            isDarkMode={isDarkTheme}
          />
        </View>

        {/* ANSWERS */}
        <View style={styles.answersContainer}>
          {respuestasPreg.length > 0 &&
            respuestasPreg.map((respuesta: obRespuesta) => {
              const esSeleccionada = respuesta.id_pre2 === respuesta.id_pre && respuesta.id_res === respuesta.id_res1;
              
              // 🎨 USA EL MISMO COLOR DEL CARD - NO HARDCODEADO
              let backgroundColor = themeColors.backgroundCard; // 🔥 ARREGLADO
              let textColor = isDarkTheme ? '#D0D0D0' : '#333333';
              let borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : '#D0D0D0';
              let borderWidth = 2;
              let icon = null;

              // console.log('💡 Respuesta backgroundColor:', backgroundColor);

              // 🎯 READONLY MODE (Resultados) - SOLO cambia el BORDE
              if (readonly && esSeleccionada) {
                const esCorrecta = respuesta.val_res === 'Verdadero';
                
                if (isDarkTheme) {
                  borderColor = esCorrecta ? '#4CAF50' : '#EF5350';
                  borderWidth = 3;
                  textColor = esCorrecta ? '#81C784' : '#EF9A9A';
                } else {
                  borderColor = esCorrecta ? '#4CAF50' : '#F44336';
                  borderWidth = 3;
                  textColor = esCorrecta ? '#2E7D32' : '#C62828';
                }
                
                icon = (
                  <Icon
                    name={esCorrecta ? 'check-circle' : 'close-circle'}
                    size={22}
                    color={borderColor}
                  />
                );
              } 
              // ✅ SELECTED MODE (Durante el examen) - SOLO cambia el BORDE
              else if (esSeleccionada) {
                borderColor = '#1976D2';
                borderWidth = 3;
                icon = <Icon name="radiobox-marked" size={22} color="#1976D2" />;
                // console.log('🔘 Respuesta seleccionada - SOLO BORDE:', { borderColor, borderWidth });
              }

              return (
                <TouchableOpacity
                  key={respuesta.id_res}
                  style={[
                    styles.answerButton,
                    { 
                      backgroundColor,
                      borderColor,
                      borderWidth,
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
                        styles={`color: ${textColor}; font-size: 15px; font-weight: 500;`}
                        isDarkMode={isDarkTheme}
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
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionContent: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    marginRight: 2,
  },
  answerTextContainer: {
    flex: 1,
  },
});