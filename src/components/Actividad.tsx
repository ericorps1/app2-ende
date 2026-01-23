import React, { useEffect, useState } from 'react'
import { ActividadData } from '../interfaces/appInterfaces'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDateActividades } from '../hooks/useFormats';
import { useIsFocused } from '@react-navigation/core';
import cafeApi from '../api/estudianteAPI';
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

interface ActividadProps {
  actividad: ActividadData;
  key: number;
  onPress: () => void;
}

export const Actividad = ({ actividad, onPress }: ActividadProps) => {
  const { colors: themeColors } = useTheme(); // 👈 HOOK
  const [calAct, setCalAct] = useState({ pun_cal_act: 0, fec_cal_act: '', int_cal_act: 0 });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) getCalAct();
  }, [isFocused]);

  const getCalAct = async () => {
    const { data } = await cafeApi.get('cal_act/' + actividad.id_cal_act);
    if (data.trans) {
      setCalAct(data.data[0]);
    }
  };

  let iconName = 'file-document-outline';
  
  switch (actividad.tipo) {
    case 'Entregable': 
      iconName = 'file-document-outline';
      break;
    case 'Examen': 
      iconName = 'clipboard-text-outline';
      break;
    case 'Foro': 
      iconName = 'forum-outline';
      break;
  }

  let colorStatus = '#34C759';
  let statusAct = 'Calificada';
  let statusIcon = 'check-circle';
  
  if (!calAct.fec_cal_act) {
    if (actividad.estatus_fecha === 'Vencida') {
      colorStatus = '#FF3B30';
      statusAct = 'Vencida';
      statusIcon = 'alert-circle';
    } else {
      colorStatus = '#FF9500';
      statusAct = 'Pendiente';
      statusIcon = 'clock-outline';
    }
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { 
        backgroundColor: themeColors.backgroundCard,
        borderColor: themeColors.borderGray 
      }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* HEADER CON ÍCONO Y STATUS */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: themeColors.backgroundGray }]}>
          <Icon name={iconName} size={24} color={themeColors.textSecondary} />
        </View>
        
        <View style={styles.headerContent}>
          <View style={[styles.typeBadge, { backgroundColor: themeColors.backgroundGray }]}>
            <Text style={[styles.typeText, { color: themeColors.textSecondary }]}>
              {actividad.tipo}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: colorStatus }]}>
          <Icon name={statusIcon} size={13} color="#FFF" />
        </View>
      </View>

      {/* TÍTULO */}
      <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={2}>
        {actividad.titulo}
      </Text>

      {/* PUNTOS */}
      <View style={styles.pointsSection}>
        <View style={[styles.pointCard, { backgroundColor: themeColors.backgroundGray }]}>
          <Icon name="star-outline" size={14} color={themeColors.textSecondary} />
          <View style={styles.pointInfo}>
            <Text style={[styles.pointLabel, { color: themeColors.textSecondary }]}>
              Puntos totales
            </Text>
            <Text style={[styles.pointValue, { color: themeColors.textPrimary }]}>
              {actividad.puntaje}
            </Text>
          </View>
        </View>

        <View style={[styles.pointCard, { backgroundColor: themeColors.backgroundGray }]}>
          <Icon name="star" size={14} color={themeColors.textSecondary} />
          <View style={styles.pointInfo}>
            <Text style={[styles.pointLabel, { color: themeColors.textSecondary }]}>
              Puntos obtenidos
            </Text>
            <Text style={[styles.pointValue, { color: themeColors.textPrimary }]}>
              {calAct.pun_cal_act || 'Sin calificar'}
            </Text>
          </View>
        </View>
      </View>

      {/* FECHAS */}
      <View style={[styles.datesSection, { borderColor: themeColors.borderGray }]}>
        <View style={styles.dateRow}>
          <Icon name="calendar-start" size={13} color={themeColors.textTertiary} />
          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
            {formatDateActividades(actividad.inicio)}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <Icon name="calendar-end" size={13} color={themeColors.textTertiary} />
          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
            {formatDateActividades(actividad.fin)}
          </Text>
        </View>
      </View>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View style={[styles.statusLabel, { backgroundColor: colorStatus + '15' }]}>
          <Text style={[styles.statusText, { color: colorStatus }]}>{statusAct}</Text>
        </View>
        <Icon name="chevron-right" size={18} color={themeColors.borderGray} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 20,
  },
  pointsSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pointCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 9,
    gap: 8,
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '500',
  },
  pointValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  datesSection: {
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});