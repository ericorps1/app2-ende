import React from 'react'
import { ActividadPendiente } from '../interfaces/appInterfaces'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Avatar, Button, Card, Paragraph, Title } from 'react-native-paper';
import { colors, platformTheme } from '../theme/platformTheme';
import { Image, StyleProp } from 'react-native';
import { formatDateActividades } from '../hooks/useFormats';
import { useNavigation } from '@react-navigation/core';
import { updateInfo } from '../features/chatBloque/dataChatSlice';
import { useAppDispatch } from '../app/hooks';
import { baseUrlSite } from '../hooks/useGlobal';
import endeApi from '../api/estudianteAPI';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
interface PropsCardActividadPendiente {
  actividadPendiente: ActividadPendiente;
  viewType: 'normal' | 'mini';
}


export const CardActividadPendiente = ({actividadPendiente, viewType}:PropsCardActividadPendiente) => {
  const dispatch = useAppDispatch();
  let iconName = 'file';
  switch (actividadPendiente.tipo) {
    case 'Entregable': iconName = 'file'; break;
    case 'Examen': iconName = 'diagnoses'; break;
    case 'Foro': iconName = 'comment'; break;
  }

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
      activeOpacity={0.8}
      style={styles.container}
      onPress={pressActPendiente}
    >
      <View style={ [styles.iconWrapper, viewType === 'mini' ? { width: 50, height: 50 } : { width: 70, height: 70 }]}>
        <FontAwesome5Icon name={iconName} style={{ ...styles.icon, fontSize: viewType === 'mini' ? 20 : 30,}} />
      </View>
      <View style={styles.contaierInfoActividad}>
        <Text style={styles.titleActividad}>{ 
          actividadPendiente.tipo==='Entregable' 
            ? 'Tarea' 
            : actividadPendiente.tipo==='Examen' 
              ? 'Cuestionario' 
              : actividadPendiente.tipo
          }</Text>
        <Text style={styles.descActividad}>{ actividadPendiente.actividad}</Text>
        {
          viewType==='normal' && <View style={styles.containerFooterAct}>
            <Text style={styles.textFooter}>
              Desde: {formatDateActividades(actividadPendiente.inicio)}{"\n"}
              Hasta: {formatDateActividades(actividadPendiente.fin)}
            </Text>
          </View>
        }
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    ...platformTheme.fila,
    margin: 5,
  },
  contaierInfoActividad: {
    marginLeft: 5,
    width: '100%',
    flex: 1,
  },
  titleActividad: {
    fontSize: 16,
    color: colors.darkBlue,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  descActividad: {
    fontSize: 14,
    color: colors.darkSilver,
  },
  containerFooterAct: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  textFooter: {
    fontSize: 12,
    marginBottom: 5
  },
  icon: {
    color: colors.primary,
  },
  iconWrapper: {
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
});