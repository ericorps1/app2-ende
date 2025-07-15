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

export const Examen = ({ route, navigation }: PropsActividad) => {
  const { data_alumno } = useContext(AuthContext);
  const { identificador_copia, titulo, descripcion, dur_exa, id_cal_act, inicio, fin, puntaje, estatus_fecha } = route.params.data_actividad;

  const [calAct, setCalAct] = useState({ pun_cal_act: 0, fec_cal_act: '', int_cal_act: 0 });
  const [visibleAlertInicExa, setVisibleAlertInicExa] = useState(false);
  const [visibleAlertFinExamen, setVisibleAlertFinExamen] = useState(false);
  const [visibleAlertNoIntentos, setVisibleAlertNoIntentos] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) getIntentos();
  }, [isFocused]);

  const getIntentos = async () => {
    const { data } = await cafeApi.get('cal_act/' + id_cal_act);
    if (data.trans) setCalAct(data.data[0]);
  }

  const iniciarExamen = async () => {
    const config = { headers: { 'Content-Type': 'text/plain' } };
    const { data } = await cafeApi.put('cal_act/' + id_cal_act, JSON.stringify({ int_cal_act: calAct.int_cal_act - 1, fec_cal_act: 'now' }), config);
    const cleanResp = await cafeApi.post('respuesta_alumno/limpiarrespuestas/' + id_cal_act + '/' + identificador_copia + '/' + data_alumno?.id_alu_ram);
    if (data.trans && cleanResp.data.trans) {
      await getIntentos();
      setVisibleAlertInicExa(false);
      navigation.navigate('ExamenRespuesta', { data_actividad: { ...route.params.data_actividad, readonly: false } });
    }
  }

  const nuevoIntentoExamen = () => {
    calAct.int_cal_act > 0 ? setVisibleAlertInicExa(true) : setVisibleAlertNoIntentos(true);
  }

  const finalizarExamen = async () => {
    const config = { headers: { 'Content-Type': 'text/plain' } };
    const { data } = await cafeApi.put('cal_act/' + id_cal_act, JSON.stringify({ int_cal_act: 0 }), config);
    if (data.trans) getIntentos();
    setVisibleAlertFinExamen(false);
  }

  const verResultadoExamen = () => {
    navigation.navigate('ExamenRespuesta', { data_actividad: { ...route.params.data_actividad, readonly: true } });
  }

  const estatus = calAct.fec_cal_act ? 'Calificada' : estatus_fecha === 'Vencida' ? 'Vencida' : 'Pendiente';
  const estatusColor = {
    Calificada: colors.success,
    Pendiente: colors.warning,
    Vencida: colors.error
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={titulo} />
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.section}>
          <TitleCard title="Detalles del Examen" />
          <InfoRow label="Inicio" value={moment(inicio).format('DD/MMM/YYYY')} />
          <InfoRow label="Fin" value={moment(fin).format('DD/MMM/YYYY')} />
          <InfoRow label="Duración" value={`${dur_exa} minutos`} />
          <InfoRow label="Puntaje total" value={puntaje} />
        </View>

        <View style={styles.section}>
          <TitleCard title="Tu Progreso" />
          <InfoRow label="Calificación" value={calAct.pun_cal_act || 'Sin calificación'} />
          <InfoRow label="Finalizado" value={calAct.fec_cal_act ? moment(calAct.fec_cal_act).format('DD/MMM/YYYY h:mm:ss a') : 'Pendiente'} />
          <InfoRow label="Intentos disponibles" value={calAct.int_cal_act} />
          <InfoRow label="Estatus" value={estatus} color={estatusColor[estatus]} />
        </View>

        <View style={styles.section}>
          <TitleCard title="Descripción" />
          <View style={{ paddingHorizontal: 4 }}>
            <HtmlToJsx strHtml={descripcion} />
          </View>
        </View>

        {estatus === 'Calificada' && calAct.int_cal_act > 0 && (
          <View style={styles.section}>
            <Text style={styles.noticeText}>
              Puedes volver a intentar el examen. Tu calificación actual es de {calAct.pun_cal_act} puntos.
            </Text>
            <Button
              icon="clock-end"
              mode="contained"
              style={[platformTheme.btnSuccess, platformTheme.shadowBox, { marginTop: 10 }]}
              onPress={() => setVisibleAlertFinExamen(true)}
            >FINALIZAR EXAMEN</Button>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.warningText}>
            ⚠️ Si cierras la app o cambias de ventana durante el examen, perderás un intento.
          </Text>
          <Button
            icon="file-document-edit"
            mode="contained"
            style={[platformTheme.btnPrimary, platformTheme.shadowBox, { marginTop: 10 }]}
            onPress={calAct.int_cal_act > 0 ? nuevoIntentoExamen : verResultadoExamen}
          >
            {calAct.int_cal_act > 0 ? 'INICIAR EXAMEN' : 'VER RESULTADO'}
          </Button>
        </View>

      </ScrollView>
      <ChatAlumno />

      {/* Modales */}
      <PaperMessages
        visible={visibleAlertInicExa}
        onDismiss={() => setVisibleAlertInicExa(false)}
        title="¿INICIAR EXAMEN?"
        message={`Se descontará 1 intento. Intentos disponibles: ${calAct.int_cal_act}`}
        buttonText="Iniciar"
        pressButton={iniciarExamen}
        dismissable
      />
      <PaperMessages
        visible={visibleAlertNoIntentos}
        onDismiss={() => setVisibleAlertNoIntentos(false)}
        title="¡SIN INTENTOS!"
        message={`No tienes más intentos para este examen.`}
        buttonText="Cerrar"
        colorTitle={colors.danger}
        styleButton={platformTheme.btnDanger}
        dismissable
      />
      <PaperMessages
        visible={visibleAlertFinExamen}
        onDismiss={() => setVisibleAlertFinExamen(false)}
        title="¿FINALIZAR EXAMEN?"
        message="Esto guardará tu nota definitiva. No podrás volver a intentarlo."
        buttonText="Finalizar"
        pressButton={finalizarExamen}
        dismissable
      />
    </SafeAreaView>
  );
};

const TitleCard = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const InfoRow = ({ label, value, color }: { label: string, value: string | number, color?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, color ? { color } : {}]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  scroll: {
    paddingHorizontal: 16,
  },
  section: {
    ...platformTheme.shadowBox,
    marginTop: 2,
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.primary
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  label: {
    fontSize: 14,
    color: '#555'
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222'
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
    marginTop: 10
  },
  noticeText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 10
  }
});