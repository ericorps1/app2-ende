import React, {useContext} from 'react'
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';


export const LoadingScreen = ({text='Cargando'}) => {

    const { token, logOut } = useContext( AuthContext );

    return (
        <View style={{ 
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>

            <Text>{text}</Text>
            <ActivityIndicator 
                size={ 50 }
                color="black"
            />
        </View>
    )
}
