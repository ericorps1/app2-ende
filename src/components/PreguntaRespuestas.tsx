import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { obPregunta, obRespuesta } from '../interfaces/appInterfaces';
import { Snackbar } from 'react-native-paper';
import { colors, platformTheme } from '../theme/platformTheme';
import { HtmlToJsx } from './HtmlToJsx';

interface PropsPreguntaRespuestas {
  pregunta: obPregunta;
  respuestasPreg: [obRespuesta];
  onPressResp: (id_pre: number, id_res: number) => void;
  loadingResp: boolean;
  numPre: number;
  readonly: boolean;
}

export const PreguntaRespuestas = ({
  pregunta,
  respuestasPreg,
  onPressResp,
  loadingResp,
  numPre,
  readonly,
}: PropsPreguntaRespuestas) => {
  const { width } = useWindowDimensions();
  // loadingResp = true;
  return (
    <View style={{ marginTop: 30 }}>
      <View
        style={{
          ...styles.containerPregunta,
          ...platformTheme.shadowBox,
          opacity: loadingResp ? 0.5 : 1,
        }}
      >
        <Text style={styles.txtNumPre}>Pregunta #{numPre}</Text>
        <View style={styles.preguntaContainer}>
          <HtmlToJsx strHtml={pregunta.pre_pre} styles={`text-align: center; font-size: 18px;`} />
        </View>

        <View style={styles.respuestasContainer}>
          {respuestasPreg.length > 0 &&
            respuestasPreg.map((respuesta: obRespuesta) => {
              const esSeleccionada = respuesta.id_pre2 === respuesta.id_pre && respuesta.id_res === respuesta.id_res1;
              let backgroundColor = colors.softSilver;
              let textColor = '#333';
              let icon = null;

              if (readonly && esSeleccionada) {
                const esCorrecta = respuesta.val_res === 'Verdadero';
                backgroundColor = esCorrecta ? '#d4edda' : '#f8d7da'; // verde claro o rojo claro
                textColor = esCorrecta ? '#155724' : '#721c24';
                icon = (
                  <FontAwesome5Icon
                    name={esCorrecta ? 'check-circle' : 'times-circle'}
                    size={18}
                    color={esCorrecta ? '#28a745' : '#dc3545'}
                    style={styles.iconoRespuesta}
                  />
                );
              } else if (esSeleccionada) {
                backgroundColor = colors.primary;
                textColor = '#fff';
              }

              return (
                <TouchableOpacity
                  key={respuesta.id_res}
                  style={[styles.btnRespuesta, { backgroundColor }]}
                  activeOpacity={1}
                  onPress={() => {
                    if (!readonly) onPressResp(respuesta.id_pre, respuesta.id_res);
                  }}
                >
                  <View style={styles.row}>
                    {icon}
                    <HtmlToJsx strHtml={respuesta.res_res} styles={`color: ${textColor}; font-size: 16px;`} />
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      {loadingResp && (
        <Snackbar visible={loadingResp} onDismiss={() => false}>
          Guardando respuesta...
        </Snackbar>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerPregunta: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  txtNumPre: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  preguntaContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  respuestasContainer: {
    gap: 12,
  },
  btnRespuesta: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconoRespuesta: {
    marginRight: 10,
  },
});
