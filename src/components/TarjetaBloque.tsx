import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { TarjetaBloqueINT } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  BloqueDetalle: { bloque_data: TarjetaBloqueINT['bloque_data']; nom_mat: string | undefined };
};

export const TarjetaBloque = ({ bloque_data, nom_mat }: TarjetaBloqueINT) => {
  const { id_blo, nom_blo, des_blo, img_blo } = bloque_data;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const pressTarjetaBloque = () => {
    navigation.navigate('BloqueDetalle', { bloque_data, nom_mat });
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={pressTarjetaBloque}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: 'https://plataforma.ahjende.com/fondos_clase/' + img_blo }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <View style={styles.overlay} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="book-open-page-variant" size={20} color="#FFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={2}>{nom_blo}</Text>
              {des_blo && (
                <Text style={styles.subtitle} numberOfLines={2}>{des_blo}</Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.badge}>
              <Icon name="eye" size={12} color="#FFF" />
              <Text style={styles.badgeText}>Ver contenido</Text>
            </View>
            <Icon name="arrow-right" size={20} color="#FFF" />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  imageBackground: {
    width: '100%',
    height: 180,
    justifyContent: 'space-between',
  },
  image: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});