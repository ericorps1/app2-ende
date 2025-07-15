import React, { useState } from 'react'
import { View, StyleSheet, Text, ColorValue, TouchableOpacity } from 'react-native';
import { colors } from '../theme/platformTheme';

type EventOK = () => void | Boolean

let txtColor:ColorValue;

export const AlertMessage = ( title: string, message: string, msgType='success', eventOk:EventOK=() => {return false}) => {
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
            <View style={ styles.alertWindow }>
                <Text style={ {
                    ...styles.title,
                    color: txtColor
                } }> 
                    { title } 
                </Text>
                <Text style={ {
                    ...styles.body,
                    color: 'black'
                } }> 
                    { message } 
                </Text>
                <TouchableOpacity style={styles.btnOK} onPress={eventOk}>
                    <Text style={{color:'white',fontSize:15}}>OK</Text>
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
        backgroundColor: 'white',
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
        marginVertical: 10
    },
    btnOK: {
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: colors.darkBlue,
        color: 'white',
        marginTop: 20,
    }
});
