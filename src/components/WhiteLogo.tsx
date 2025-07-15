import React from 'react'
import { Image, View } from 'react-native'

export const WhiteLogo = () => {
    return (
        <View style={{
            alignItems: 'center'
        }}>
            <Image 
                source={ require('../assets/logoLogin.png') }
                style={{
                    width: 250,
                    height: 100 
                }}
            />
        </View>
    )
}
