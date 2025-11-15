import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Notification } from "../interfaces/appInterfaces";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/core";

interface CardNotificationProps {
  notification: Notification;
}

export const CardNotification = ({notification}:CardNotificationProps) => {
  const navigation = useNavigation<any>();
  const isUnread = notification.est_not !== 'Leida';
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={() => navigation.navigate('DetalleNotificacion', { notification })}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconWrapper}>
          <Icon name="bell-outline" size={20} color="#000" />
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
          {notification.tit_not}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.men_not}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color="#D0D0D0" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unreadContainer: {
    backgroundColor: '#F0F8FF',
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
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
    fontWeight: '600',
    color: '#000',
    marginBottom: 3,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 19,
  },
});