import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { TarjetaBloqueINT } from '../interfaces/appInterfaces';
import { colors } from '../theme/platformTheme';
import LinearGradient from 'react-native-linear-gradient';

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
    <Card
      style={styles.card}
      elevation={5}
      onLongPress={() => console.log('card longpress ' + id_blo)}
      onPress={pressTarjetaBloque}
    >
      <LinearGradient
        colors={['#e0f7fa', colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Card.Title
          title={nom_blo}
          subtitle={des_blo}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />
        <Card.Cover
          style={styles.cardCover}
          source={{ uri: 'https://plataforma.ahjende.com/fondos_clase/' + img_blo }}
        />
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: 'transparent', // esto ayuda pero no es suficiente sin los otros ajustes
  },
  gradientBackground: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  cardCover: {
    height: 180,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    margin: 5,
  },
  title: {
    color: '#004d40',
    fontWeight: 'bold',
    fontSize: 24,
  },
  subtitle: {
    color: '#006064',
  },
});
