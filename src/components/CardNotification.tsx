import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Notification } from "../interfaces/appInterfaces";
import { colors, platformTheme } from "../theme/platformTheme";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/core";

interface CardNotificationProps {
  notification: Notification;
}

export const CardNotification = ({notification}:CardNotificationProps) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, {backgroundColor: notification.est_not === 'Leida' ? colors.white : colors.softSilver}]}
      onPress={() => navigation.navigate('DetalleNotificacion', { notification })}
    >
      <View style={ styles.iconWrapper }>
        <FontAwesome5Icon name={'bell'} style={ styles.icon } />
      </View>
      <View style={styles.contaierInfoActividad}>
        <Text style={styles.titleActividad}>{ notification.tit_not }</Text>
        <Text style={styles.messageText}>{notification.men_not.length > 90 ? `${notification.men_not.substring(0, 90)}...` : notification.men_not}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    ...platformTheme.fila,
    padding: 5,
    marginBottom: 2,
    borderRadius: 10
  },
  contaierInfoActividad: {
    marginLeft: 5,
    width: '100%',
    flex: 1,
  },
  titleActividad: {
    fontSize: 16,
    color: '#000000', // NEGRO - SIEMPRE SE VE
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: '#333333', // GRIS OSCURO - SIEMPRE SE VE
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
    fontSize: 20,
  },
  iconWrapper: {
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    width: 50,
    height: 50,
  },
});