import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { MensajesChatAlumno } from '../components/MensajesChatAlumno';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatSalaProps {
    route: {
        params: {
            id_sal: number;
            des_sal: string;
        }
    },
    navigation: any
}

export const ChatSala = ({ route, navigation }:ChatSalaProps) => {
    const {id_sal,des_sal} = route.params;
    return (
        <SafeAreaView style={styles.container}>
            <BackButtonNavigation onPressBack={() => navigation.pop()} title={des_sal}/>
            <MensajesChatAlumno 
                id_sal={id_sal}
                welcomeMsg={<></>}
                id_pro={44}
                heightChatHistory={600}
                placeHolderInputTxt='Envía un mensaje...'
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    }
});