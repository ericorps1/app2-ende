import React, { useState } from 'react'
import { View, StyleSheet, Text, ColorValue, TouchableOpacity } from 'react-native';
import { colors } from '../theme/platformTheme';
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

type EventOK = () => void | Boolean

export const AlertMessage = ( title: string, message: string, msgType='success', eventOk:EventOK=() => {return false}) => {
    const { colors: themeColors } = useTheme(); // 👈 HOOK
    
    let txtColor:ColorValue;
    
    switch(msgType){
        case 'success' :
            txtColor=colors.info
            break;
        case 'error' : 
            txtColor=colors.error
            break;
        case 'danger' : 
            txtColor=colors.danger
            break;
    }
    
    return (
        <View style={ styles.container }>
            <View style={ [styles.alertWindow, { backgroundColor: themeColors.backgroundCard }] }>
                <Text style={ {
                    ...styles.title,
                    color: txtColor
                } }> 
                    { title } 
                </Text>
                <Text style={ {
                    ...styles.body,
                    color: themeColors.textPrimary // 👈 DINÁMICO
                } }> 
                    { message } 
                </Text>
                <TouchableOpacity 
                    style={[styles.btnOK, { backgroundColor: themeColors.textPrimary }]} // 👈 DINÁMICO
                    onPress={eventOk}
                >
                    <Text style={[styles.btnText, { color: themeColors.backgroundCard }]}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(52, 52, 52, 0.5)',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    alertWindow: {
        top: '30%',
        margin: '10%',
        borderRadius: 10,
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    body: {
        fontSize: 15,
        marginVertical: 10,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    btnOK: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 100,
        marginTop: 20,
    },
    btnText: {
        fontSize: 15,
        fontWeight: '600',
    }
});