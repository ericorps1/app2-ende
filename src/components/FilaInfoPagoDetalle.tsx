import React from 'react'
import { View, Text, StyleSheet, ColorValue } from 'react-native';
import { FormatAmount } from '../hooks/useFormats';
import { colors } from '../theme/platformTheme';

interface PropsFilaInfoPagoDetalle{
    texto: string;
    valor: any;
    colorTexto?: ColorValue;
    colorValor?: ColorValue;
    tamanoTexto?: number;
    tamanoValor?: number;
    flex?: number;
}

export const FilaInfoPagoDetalle = ({texto,valor,colorTexto=colors.darkBlue,colorValor=colors.silver, tamanoTexto=15, tamanoValor=20, flex=10}:PropsFilaInfoPagoDetalle) => {
  return (
    <View style={ styles.container }>
        <Text style={ { ...styles.text, color: colorTexto, fontSize: tamanoTexto } }>{texto}</Text>
        <Text style={ { ...styles.text, color: colorValor, fontSize: tamanoValor } }>{valor}</Text>
    </View>
    // <View style={ {...styles.fila, flex: flex } }>
    //     <Text style={ { ...styles.text, color: colorTexto, fontSize: tamanoTexto } }>{texto}</Text>
    //     <Text style={ { ...styles.text, color: colorValor, fontSize: tamanoValor } }>{valor}</Text>
    // </View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10
    },
    fila: {
        marginRight: 5,
    },
    text: {
        textAlignVertical: 'center',
    }
});
