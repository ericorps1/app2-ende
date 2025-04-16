import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { colors, platformTheme } from '../theme/platformTheme';

interface PropsNoDataResult {
    msg: string;
    styleContainer?: object|false;
    styleText?: object|false;
}

export const NoDataResult = ({msg,styleContainer=false,styleText=false}:PropsNoDataResult) => {
    return (
        <View style={styleContainer ? styleContainer : styles.container}>
            <Text style={styleText ? styleText : styles.textMsg}>{msg}</Text>
        </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20
    },
    textMsg: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.darkBlue
    }
});