import React from 'react'
import { ActividadPendiente } from '../interfaces/appInterfaces'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { formatDateActividades } from '../hooks/useFormats';
import { useNavigation } from '@react-navigation/core';
import { updateInfo } from '../features/chatBloque/dataChatSlice';
import { useAppDispatch } from '../app/hooks';
import endeApi from '../api/estudianteAPI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PropsCardActividadPendiente {
  actividadPendiente: ActividadPendiente;
  viewType: 'normal' | 'mini';
}

export const CardActividadPendiente = ({actividadPendiente, viewType}:PropsCardActividadPendiente) => {
  const { colors: themeColors } = useTheme();
  const dispatch = useAppDispatch();
  
  const getIconData = (tipo: string) => {
    switch (tipo) {
      case 'Entregable': 
        return { icon: 'file-document-outline', label: 'Tarea' };
      case 'Examen': 
        return { icon: 'clipboard-text-outline', label: 'Cuestionario' };
      case 'Foro': 
        return { icon: 'forum-outline', label: 'Foro' };
      default: 
        return { icon: 'file-outline', label: tipo };
    }
  };

  const iconData = getIconData(actividadPendiente.tipo);
  const navigation = useNavigation<any>();

  const pressActPendiente = async() => {
    const {id_blo,nom_blo,des_blo,con_blo,id_sub_hor,nom_mat} = actividadPendiente;
    await loadDataMiniChat(id_sub_hor,nom_mat);
    const bloque_data = {id_blo,nom_blo,des_blo,con_blo,id_sub_hor};
    navigation.navigate('BloqueDetalle', {bloque_data, nom_mat})
  }

  const loadDataMiniChat = async(id_sub_hor:number,nom_mat:string) => {
    const {data} = await endeApi.get('/sub_hor/dataProfesorxSubHor/'+id_sub_hor);
    if(data.trans){
      const dataPro = data.data[0];
      dispatch(updateInfo(
        {
          id_emp: dataPro.id_emp,
          id_pro: dataPro.id_pro,
          nom_pro: dataPro.nom_emp+' '+dataPro.app_emp+' '+dataPro.apm_emp,
          fot_emp: dataPro.fot_emp,
          tipo: dataPro.tip_emp,
          id_sub_hor,
          materia: nom_mat
        }
      ));
    }
    return true;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, { 
        backgroundColor: themeColors.backgroundCard,
        borderBottomColor: themeColors.borderGray
      }]}
      onPress={pressActPendiente}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconWrapper, { backgroundColor: themeColors.backgroundGray }]}>
          <Icon name={iconData.icon} size={20} color={themeColors.textPrimary} />
        </View>
        <View style={styles.pendingDot} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
          {iconData.label}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {actividadPendiente.actividad}
        </Text>
        {viewType === 'normal' && (
          <Text style={[styles.dateText, { color: themeColors.textTertiary }]}>
            Hasta: {formatDateActividades(actividadPendiente.fin)}
          </Text>
        )}
      </View>
      <Icon name="chevron-right" size={20} color={themeColors.textTertiary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginLeft: -8,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
  },
});