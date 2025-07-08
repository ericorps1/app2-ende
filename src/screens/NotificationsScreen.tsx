import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { useAppSelector } from '../app/hooks';
import { Notification } from '../interfaces/appInterfaces';
import { formatDateHour } from '../hooks/useFormats';
import { colors } from '../theme/platformTheme';

const getStatusIcon = (status: 'Pendiente' | 'Enviada' | 'Recibida' | 'Leida') => {
  let icon = 'bell';
  switch (status) {
    case 'Leida':
      icon = 'check';
      break;
    case 'Pendiente':
      icon = 'clock';
      break;
    case 'Recibida':
      icon = 'bell';
      break;
    case 'Enviada':
      icon = 'paper-plane';
      break;
    default:
      return 'bell';
  }
  return <FontAwesome5Icon name={icon} style={styles.icon}/>;
};

export const NotificationsScreen = ({route,navigation}:any) => {
  const notifications:Notification[] = useAppSelector(state => state.datanotifications);

  const renderItem = ({ item }:any) => {
    const [date,_] = item.fec_not.split(' ');
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('DetalleNotificacion', { notification: item })}
        style={[styles.card, {backgroundColor: item.est_not === 'Leida' ? colors.white : colors.softSilver}]}
      >
        <View style={styles.iconContainer}>{getStatusIcon(item.est_not)}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.tit_not}</Text>
          <Text style={styles.body}>{item.men_not.length > 90 ? `${item.men_not.substring(0, 90)}...` : item.men_not}</Text>
          <Text style={styles.date}>{formatDateHour(item.fec_not)}</Text>
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={'Notificaciones'}/>
      <FlatList
        data={notifications}
        keyExtractor={(item) => 'notificationsScreen'+item.id_not.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
});