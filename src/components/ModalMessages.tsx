import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { Button, Modal } from 'react-native-paper';
import { TypesMsgModalType } from '../interfaces/appInterfaces';
import { colors } from '../theme/platformTheme';

interface Props{
    visible: boolean;
    typeMsgModal: TypesMsgModalType;
    modalText: string;
    onDismiss: () => void;
}


export const ModalMessages = ({ visible, typeMsgModal, modalText, onDismiss}:Props) => {
  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        {(typeMsgModal==='info') && <Text style={ { ...styles.modalContainerTitle, color: colors.info } }>¡INFORMACIÓN!</Text>}
        {(typeMsgModal==='success') && <Text style={ { ...styles.modalContainerTitle, color: colors.success } }>¡EXITO!</Text>}
        {(typeMsgModal==='danger') && <Text style={ { ...styles.modalContainerTitle, color: colors.danger } }>¡ADVERTENCIA!</Text>}
        {(typeMsgModal==='error') && <Text style={ { ...styles.modalContainerTitle, color: colors.error } }>¡ERROR!</Text>}
        <Text style={ styles.modalContainerText }>{ modalText }</Text>
        <View style={ { alignItems: 'center' } }>
            <Button 
                onPress={ onDismiss }
                style={ styles.botonCerrar }
                color='white'
            >Aceptar</Button>
        </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: '5%',
        borderRadius: 5,
    },
    modalContainerTitle: {
        fontSize: 25,
        fontWeight: '800',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.softSilver,
        paddingBottom: 10,
    },
    modalContainerText: {
        fontSize: 16,
        color: colors.darkBlue,
        marginBottom: 20
    },
    botonCerrar: {
        backgroundColor: colors.primary,
        color: 'white'
    }
});
