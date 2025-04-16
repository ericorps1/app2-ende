import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
// import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../theme/platformTheme';
import { PanelNotifications } from './PanelNotifications';
import { AuthContext } from '../context/AuthContext';
import cafeApi from '../api/estudianteAPI';

export const HeaderRight = () => {
  const { data_alumno } = useContext( AuthContext );
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const width = useWindowDimensions().width-100;
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  }
  useEffect(() => {
    console.log("re-render");
    getActividadesPendientes();
    return () => {}
  }, [])
  const getActividadesPendientes = async() => {
    const {data} = await cafeApi.get(`notificaciones_actividad/${data_alumno?.id_alu}`);
    if(data.trans){
      setActividadesPendientes(data.data);
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={{...styles.iconContainer, backgroundColor: showNotifications ? colors.darkBlue : colors.softSilver}}>
        <Text>Atras</Text>
        {/* <FontAwesome5Icon 
          name={'bell'}
          style={{...styles.icon, color: showNotifications ? colors.softSilver : colors.darkBlue}}
          onPress={toggleNotifications}
        /> */}
      </View>
      {showNotifications && (
      <View style={{...styles.contentNotifications, width}}>
        <PanelNotifications
          actividadesPendientes={actividadesPendientes}
          loading={loading}
        />
      </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 15,
  },
  iconContainer: {
    position: 'relative',
    borderRadius: 50,
    overflow: 'hidden',
    padding: 5,
    width: 40,
    height: 40,
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
      fontSize: 25,
  },
  contentNotifications: {
    backgroundColor: colors.white,
    borderRadius: 5,
    position: 'absolute',
    top: 40,
    right: 0,
    zIndex: 1,
    padding: 5,
    elevation: 10,
    borderWidth: 1,
  }
})
