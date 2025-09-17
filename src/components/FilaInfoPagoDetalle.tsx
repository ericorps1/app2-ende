import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

interface Props {
  texto: string;
  valor: any;
  colorValor?: string;
  tamanoValor?: number;
  flex?: number;
  iconName?: string;
  iconColor?: string;
  style?: object;
}

export const FilaInfoPagoDetalle = ({ 
  texto, 
  valor, 
  colorValor = 'black', 
  tamanoValor = 18, 
  flex = 10,
  style,
}: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={{ flex: flex, fontSize: 18 }}>{texto}</Text>
      <Text style={{ flex: 14, fontSize: tamanoValor, fontWeight: 'bold', color: colorValor, textAlign: 'right' }}>
        {valor}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
});
