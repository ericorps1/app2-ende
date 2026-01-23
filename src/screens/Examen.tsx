import React, { useContext, useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl, useColorScheme } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { PropsActividad } from '../interfaces/appInterfaces';
import { colors, platformTheme } from '../theme/platformTheme';
import { HtmlToJsx } from '../components/HtmlToJsx';
import PaperMessages from '../components/PaperMessages';
import cafeApi from '../api/estudianteAPI';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/core';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Examen = ({ route, navigation }: PropsActividad) => {
  const { theme, colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { data_alumno } = useContext(AuthContext);
  const { identificador_copia, titulo, descripcion, dur_exa, id_cal_act, inicio, fin, puntaje, estatus_fecha } = route.params.data_actividad;

  const [calAct, setCalAct] = useState({ pun_cal_act: 0, fec_cal_act: '', int_cal_act: 0 });
  const [visibleAlertInicExa, setVisibleAlertInicExa] = useState(false);
  const [visibleAlertFinExamen, setVisibleAlertFinExamen] = useState(false);
  const [visibleAlertNoIntentos, setVisibleAlertNoIntentos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    const isDark = bg === '#000' || 
                   bg === '#000000' ||
                   bg === '#121212' || 
                   bg === '#1a1a1a' ||
                   cardBg === '#000' ||
                   cardBg === '#000000' ||
                   cardBg === '#121212' ||
                   cardBg === '#1e1e1e' ||
                   cardBg === '#1a1a1a' ||
                   textPrimary === '#fff' ||
                   textPrimary === '#ffffff' ||
                   textPrimary === '#f5f5f5' ||
                   bg.includes('black') ||
                   (bg.startsWith('#') && parseInt(bg.replace('#', ''), 16) < 3355443);
    
    return isDark;
  })();

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
  
  const estatusConfig = isDarkTheme ? {
    Calificada: { color: '#A8C4A8', bg: '#2D352E' },
    Pendiente: { color: '#D4BDA0', bg: '#352F2A' },
    Vencida: { color: '#D0A8A0', bg: '#382E2D' }
  } : {
    Calificada: { color: '#34C759', bg: '#E8F5E9' },
    Pendiente: { color: '#FF9500', bg: '#FFF3E0' },
    Vencida: { color: '#FF3B30', bg: '#FFEBEE' }
  };

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
          onPress={() => navigation.pop()} 
          style={[
            styles.backButton, 
            { 
              backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray 
            }
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
            Examen
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 100 + insets.bottom } // 🔥 AJUSTADO: Espacio para el botón + safe area
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.textPrimary}
            colors={[themeColors.textPrimary]}
          />
        }
      >
        {/* STATUS BADGE */}
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: estatusConfig[estatus].bg,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
            borderWidth: isDarkTheme ? 1 : 0
          }
        ]}>
          <Text style={[styles.statusText, { color: estatusConfig[estatus].color }]}>
            {estatus}
          </Text>
        </View>

        {/* SCORE CARD */}
        {calAct.pun_cal_act > 0 && (
          <View style={[
            styles.scoreCard, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
            }
          ]}>
            <Text style={[styles.scoreLabel, { color: themeColors.textTertiary }]}>
              Calificación
            </Text>
            <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>
              {calAct.pun_cal_act}
            </Text>
            <Text style={[styles.scoreMax, { color: themeColors.textSecondary }]}>
              de {puntaje} pts
            </Text>
          </View>
        )}

        {/* INFO GRID */}
        <View style={styles.infoGrid}>
          <View style={[
            styles.infoItem, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
            }
          ]}>
            <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>
              Inicio
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              {moment(inicio).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View style={[
            styles.infoItem, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
            }
          ]}>
            <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>
              Fin
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              {moment(fin).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View style={[
            styles.infoItem, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
            }
          ]}>
            <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>
              Duración
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              {dur_exa} min
            </Text>
          </View>
          <View style={[
            styles.infoItem, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
            }
          ]}>
            <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>
              Intentos
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              {calAct.int_cal_act}
            </Text>
          </View>
        </View>

        {/* FINALIZED DATE */}
        {calAct.fec_cal_act && (
          <View style={[
            styles.dateCard, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
            }
          ]}>
            <Text style={[styles.dateLabel, { color: themeColors.textTertiary }]}>
              Finalizado
            </Text>
            <Text style={[styles.dateValue, { color: themeColors.textPrimary }]}>
              {moment(calAct.fec_cal_act).format('DD/MM/YYYY h:mm a')}
            </Text>
          </View>
        )}

        {/* DESCRIPTION */}
        <View style={[
          styles.descriptionCard, 
          { 
            backgroundColor: themeColors.backgroundCard,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
          }
        ]}>
          <Text style={[styles.descriptionTitle, { color: themeColors.textPrimary }]}>
            Descripción
          </Text>
          <View style={styles.descriptionContent}>
            <HtmlToJsx strHtml={descripcion} />
          </View>
        </View>

        {/* RETRY NOTICE */}
        {estatus === 'Calificada' && calAct.int_cal_act > 0 && (
          <View style={[
            styles.retryCard,
            {
              backgroundColor: isDarkTheme ? '#2A2F35' : '#E3F2FD',
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : '#90CAF9',
            }
          ]}>
            <Text style={[
              styles.retryTitle,
              { color: isDarkTheme ? '#9DB4C8' : '#1976D2' }
            ]}>
              Puedes volver a intentar
            </Text>
            <Text style={[
              styles.retryText,
              { color: isDarkTheme ? '#9DB4C8' : '#1976D2' }
            ]}>
              Calificación actual: {calAct.pun_cal_act} pts
            </Text>
            <TouchableOpacity 
              style={[
                styles.retryButton,
                { backgroundColor: isDarkTheme ? '#4E5C6A' : '#2196F3' }
              ]}
              onPress={() => setVisibleAlertFinExamen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Finalizar examen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WARNING */}
        <View style={[
          styles.warningCard,
          {
            backgroundColor: isDarkTheme ? '#352F2A' : '#FFF3E0',
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : '#FFE082',
          }
        ]}>
          <Icon 
            name="alert-circle-outline" 
            size={20} 
            color={isDarkTheme ? '#D4BDA0' : '#FF9500'} 
          />
          <Text style={[
            styles.warningText,
            { color: isDarkTheme ? '#D4BDA0' : '#E65100' }
          ]}>
            Si cierras la app o cambias de ventana durante el examen, perderás un intento
          </Text>
        </View>

      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={[
        styles.bottomContainer, 
        { 
          paddingBottom: Math.max(insets.bottom, 12) + 12, // 🔥 MÁS ESPACIO: mínimo 12px + 12px extra
          backgroundColor: themeColors.backgroundCard,
          borderTopColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.mainButton, 
            { 
              backgroundColor: isDarkTheme ? '#2A2F35' : themeColors.textPrimary,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              borderWidth: isDarkTheme ? 1 : 0
            }
          ]}
          onPress={calAct.int_cal_act > 0 ? nuevoIntentoExamen : verResultadoExamen}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.mainButtonText, 
            { color: isDarkTheme ? '#9DB4C8' : themeColors.backgroundCard }
          ]}>
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
        btnTxtCancel="Cancelar"
        evtBtnCancel={() => setVisibleAlertInicExa(false)}
        dismissable
      />
      
      <PaperMessages
        visible={visibleAlertNoIntentos}
        onDismiss={() => setVisibleAlertNoIntentos(false)}
        title="¡SIN INTENTOS!"
        message="No tienes más intentos para este examen."
        buttonText="Cerrar"
        pressButton={() => setVisibleAlertNoIntentos(false)}
        colorTitle={colors.danger}
        dismissable
      />
      
      <PaperMessages
        visible={visibleAlertFinExamen}
        onDismiss={() => setVisibleAlertFinExamen(false)}
        title="¿FINALIZAR EXAMEN?"
        message="Esto guardará tu nota definitiva. No podrás volver a intentarlo."
        buttonText="Finalizar"
        pressButton={finalizarExamen}
        btnTxtCancel="Cancelar"
        evtBtnCancel={() => setVisibleAlertFinExamen(false)}
        dismissable
      />
    </View>
  );
};

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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    // 🔥 paddingBottom ahora es dinámico arriba
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
  },
  scoreLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 15,
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
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  descriptionCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionContent: {
    paddingLeft: 4,
  },
  retryCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  retryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
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
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomContainer: {
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  mainButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});