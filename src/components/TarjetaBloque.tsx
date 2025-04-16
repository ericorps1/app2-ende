import { useNavigation } from '@react-navigation/core';
import React from 'react'
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { TarjetaBloqueINT } from '../interfaces/appInterfaces';

// const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

export const TarjetaBloque = ({bloque_data,nom_mat}:TarjetaBloqueINT) => {
  
    const {id_blo, nom_blo,des_blo,img_blo} = bloque_data;
  // console.log(bloque_data.id_blo,bloque_data.nom_blo,bloque_data.des_blo,bloque_data.img_blo,bloque_data.ord_blo,bloque_data.id_mat6,
  //   bloque_data.id_sub_hor,bloque_data.nom_sub_hor,bloque_data.est_sub_hor,bloque_data.fec_sub_hor,bloque_data.id_sub_hor_nat,
  //   bloque_data.id_sal1,bloque_data.id_gru1,bloque_data.id_mat1,bloque_data.id_pro1,bloque_data.id_fus2);

  const navigation = useNavigation();

  const pressTarjetaBloque = () => {
    navigation.navigate('BloqueDetalle', {bloque_data: bloque_data, nom_mat})
  }

  return (
    <Card style={ styles.card } elevation={5} onLongPress={()=>console.log('card longpress '+id_blo)} onPress={pressTarjetaBloque}>
      {/* <Card.Title title="Card Title" subtitle="Card Subtitle" left={LeftContent} /> */}
      <Card.Title title={nom_blo} subtitle={des_blo} />
      {/* <Card.Content>
        <Title>{nom_blo}</Title>
        <Paragraph>{des_blo}</Paragraph>
      </Card.Content> */}
      <Card.Cover style={styles.cardCover} source={{ uri: 'https://plataforma.ahjende.com/fondos_clase/'+img_blo }} />
      {/* <Card.Actions>
        <Button>Cancel</Button>
        <Button>Ok</Button>
      </Card.Actions> */}
    </Card>
  )
}

const styles = StyleSheet.create({
    card: {
      marginHorizontal: 10,
      marginVertical: 5,
      flex: 1
    },
    cardCover: {
      borderRadius: 10,
      margin: 5
    }
});