import React, { useContext, useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { PropsActividad } from '../interfaces/appInterfaces';
import { colors, platformTheme } from '../theme/platformTheme';
import { HtmlToJsx } from '../components/HtmlToJsx';
import PaperMessages from '../components/PaperMessages';
import cafeApi from '../api/estudianteAPI';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/core';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Examen = ({ route, navigation }: PropsActividad) => {
  const { data_alumno } = useContext(AuthContext);
  const { identificador_copia, titulo, descripcion, dur_exa, id_cal_act, inicio, fin, puntaje, estatus_fecha } = route.params.data_actividad;

  const [calAct, setCalAct] = useState({ pun_cal_act: 0, fec_cal_act: '', int_cal_act: 0 });
  const [visibleAlertInicExa, setVisibleAlertInicExa] = useState(false);
  const [visibleAlertFinExamen, setVisibleAlertFinExamen] = useState(false);
  const [visibleAlertNoIntentos, setVisibleAlertNoIntentos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) getIntentos();
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getIntentos();
    setRefreshing(false);
  };

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
  const estatusConfig = {
    Calificada: { color: '#34C759', bg: '#E8F5E9' },
    Pendiente: { color: '#FF9500', bg: '#FFF3E0' },
    Vencida: { color: '#FF3B30', bg: '#FFEBEE' }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.pop()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{titulo}</Text>
          <Text style={styles.headerSubtitle}>Examen</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={['#000']}
          />
        }
      >
        {/* STATUS BADGE */}
        <View style={[styles.statusBadge, { backgroundColor: estatusConfig[estatus].bg }]}>
          <Text style={[styles.statusText, { color: estatusConfig[estatus].color }]}>
            {estatus}
          </Text>
        </View>

        {/* SCORE CARD */}
        {calAct.pun_cal_act > 0 && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Calificación</Text>
            <Text style={styles.scoreValue}>{calAct.pun_cal_act}</Text>
            <Text style={styles.scoreMax}>de {puntaje} pts</Text>
          </View>
        )}

        {/* INFO GRID */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Inicio</Text>
            <Text style={styles.infoValue}>{moment(inicio).format('DD/MM/YYYY')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fin</Text>
            <Text style={styles.infoValue}>{moment(fin).format('DD/MM/YYYY')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duración</Text>
            <Text style={styles.infoValue}>{dur_exa} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Intentos</Text>
            <Text style={styles.infoValue}>{calAct.int_cal_act}</Text>
          </View>
        </View>

        {/* FINALIZED DATE */}
        {calAct.fec_cal_act && (
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>Finalizado</Text>
            <Text style={styles.dateValue}>
              {moment(calAct.fec_cal_act).format('DD/MM/YYYY h:mm a')}
            </Text>
          </View>
        )}

        {/* DESCRIPTION */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Descripción</Text>
          <View style={styles.descriptionContent}>
            <HtmlToJsx strHtml={descripcion} />
          </View>
        </View>

        {/* RETRY NOTICE */}
        {estatus === 'Calificada' && calAct.int_cal_act > 0 && (
          <View style={styles.retryCard}>
            <Text style={styles.retryTitle}>Puedes volver a intentar</Text>
            <Text style={styles.retryText}>
              Calificación actual: {calAct.pun_cal_act} pts
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setVisibleAlertFinExamen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Finalizar examen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WARNING */}
        <View style={styles.warningCard}>
          <Icon name="alert-circle-outline" size={20} color="#FF9500" />
          <Text style={styles.warningText}>
            Si cierras la app o cambias de ventana durante el examen, perderás un intento
          </Text>
        </View>

      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={calAct.int_cal_act > 0 ? nuevoIntentoExamen : verResultadoExamen}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>
            {calAct.int_cal_act > 0 ? 'Iniciar examen' : 'Ver resultado'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODALES */}
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
    </View>
  );
};

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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '47%',
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
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  dateCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  descriptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  descriptionContent: {
    paddingLeft: 4,
  },
  retryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  retryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  mainButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});