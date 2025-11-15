import React, {useContext} from 'react'
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export const LoadingScreen = ({text='Cargando'}) => {
    const { token, logOut } = useContext( AuthContext );

    return (
        <View style={styles.container}>
            <ActivityIndicator 
                size="large"
                color="#000"
            />
            <Text style={styles.text}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    text: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
});