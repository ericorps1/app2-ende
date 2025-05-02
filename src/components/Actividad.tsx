import React, { useEffect, useState } from 'react'
import { ActividadData } from '../interfaces/appInterfaces'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, platformTheme } from '../theme/platformTheme';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { formatDateActividades } from '../hooks/useFormats';
import { useIsFocused } from '@react-navigation/core';
import cafeApi from '../api/estudianteAPI';

interface ActividadProps {
  actividad: ActividadData;
  key: number;
  onPress: () => void;
}

// Componente
// COMPONENTE
export const Actividad = ({ actividad, onPress }: ActividadProps) => {
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

  let iconName = 'file';
  switch (actividad.tipo) {
    case 'Entregable': iconName = 'file'; break;
    case 'Examen': iconName = 'diagnoses'; break;
    case 'Foro': iconName = 'comment'; break;
  }

  let colorStatus = colors.success;
  let statusAct = 'Calificada';
  if (!calAct.fec_cal_act) {
    if (actividad.estatus_fecha === 'Vencida') {
      colorStatus = colors.error;
      statusAct = 'Vencida';
    } else {
      colorStatus = colors.warning;
      statusAct = 'Pendiente';
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          <FontAwesome5Icon name={iconName} style={styles.icon} />
        </View>

        <View style={styles.detailsWrapper}>
          <Text style={styles.title}>{actividad.titulo}</Text>
          <Text style={styles.tipo}>{actividad.tipo}</Text>

          <View style={styles.puntosContainer}>
            <Text style={styles.textLabel}>Puntos totales: <Text style={styles.textValue}>{actividad.puntaje}</Text></Text>
            <Text style={styles.textLabel}>Puntos ontenidos: <Text style={styles.textValue}>{calAct.pun_cal_act || 'Sin calificación'}</Text></Text>
          </View>

          <Text style={styles.fechas}>
            {formatDateActividades(actividad.inicio)} - {formatDateActividades(actividad.fin)}
          </Text>
        </View>
      </View>

      <View style={styles.statusWrapper}>
        <Text style={{ ...styles.statusText, backgroundColor: colorStatus }}>
          {statusAct}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ESTILOS
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 12,
    marginRight: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 30,
    color: colors.primary,
  },
  detailsWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  tipo: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginBottom: 6,
  },
  puntosContainer: {
    marginBottom: 6,
  },
  textLabel: {
    fontSize: 13,
    color: '#555',
  },
  textValue: {
    fontWeight: '600',
    color: '#111',
  },
  fechas: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statusWrapper: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  statusText: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 12,
    overflow: 'hidden',
  },
});
