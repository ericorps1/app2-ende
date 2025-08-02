import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { colors, statusColorsDoc, statusIconDoc } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { Touchable } from './Touchable';
import { IntDocumentationCard } from '../interfaces/appInterfaces';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

interface PropsDocumentationCard {
  data_doc: IntDocumentationCard;
  onPressEvnt: boolean;
}

const DocumentationCard = ({ data_doc, onPressEvnt = true }: PropsDocumentationCard) => {
  const navigation = useNavigation<any>();

  let onPressTP = () => {};
  if(onPressEvnt) 
    onPressTP = () => navigation.navigate('DocumentationDetails', { documentation: data_doc })

  return (
    <Touchable 
      onPress={onPressTP}
      styleContainer={{
        ...styles.card,
        borderLeftColor: statusColorsDoc[data_doc.est_doc_alu_ram]
    }}>
      <View style={styles.row}>
        <View style={[styles.col, styles.colStart, { flex: 1 }]}>
          <Text style={[styles.type,{ color: colors.silver }]}>{data_doc.nom_doc_ram}</Text>
          <FontAwesome5Icon name={'file-upload'}  size={50} style={styles.icon} />
        </View>
        <View style={[styles.col, styles.colCenter]}>
          <Text style={[styles.status, { color: statusColorsDoc[data_doc.est_doc_alu_ram] }]}>{data_doc.est_doc_alu_ram}</Text>
          <FontAwesome5Icon name={statusIconDoc[data_doc.est_doc_alu_ram]} size={50} color={statusColorsDoc[data_doc.est_doc_alu_ram]} />
          <Text style={[styles.date, { color: colors.mediumSilver }]}>{data_doc.fec_doc_alu_ram ? formatDate(data_doc.fec_doc_alu_ram) : 'Fecha no disponible'}</Text>
        </View>
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 5, // Indicador de color para el estado
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
  },
  col: {
    flexDirection: 'column',
    gap: 10,
  },
  colStart: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  colCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    marginLeft: 5,
    alignContent: 'flex-end'
  },
  icon: {
    marginTop: 15,
    marginBottom: 5
  },
});

export default DocumentationCard;