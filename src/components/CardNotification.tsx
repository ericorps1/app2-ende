import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Notification } from "../interfaces/appInterfaces";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/core";
import { useTheme } from "../context/ThemeContext";

interface CardNotificationProps {
  notification: Notification;
}

export const CardNotification = ({notification}:CardNotificationProps) => {
  const { colors: themeColors, theme } = useTheme();
  const navigation = useNavigation<any>();
  const isUnread = notification.est_not !== 'Leida';
  
  // Color de fondo para notificaciones no leídas
  const unreadBgColor = theme === 'dark' 
    ? '#3A3A3C' // 👈 Gris más claro y visible
    : '#F0F8FF'; // Azul claro en modo claro
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container, 
        { 
          backgroundColor: themeColors.backgroundGray,
          borderBottomColor: themeColors.borderGray 
        },
        isUnread && { backgroundColor: unreadBgColor }
      ]}
      onPress={() => navigation.navigate('DetalleNotificacion', { notification })}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconWrapper, { backgroundColor: themeColors.backgroundCard }]}>
          <Icon name="bell-outline" size={20} color={themeColors.textPrimary} />
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.content}>
        <Text 
          style={[
            styles.title, 
            { color: themeColors.textPrimary },
            isUnread && styles.unreadTitle
          ]} 
          numberOfLines={1}
        >
          {notification.tit_not}
        </Text>
        <Text style={[styles.message, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {notification.men_not}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={themeColors.borderGray} />
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
    marginBottom: 3,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 19,
  },
});