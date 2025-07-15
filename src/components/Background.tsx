import React from 'react'
import { View } from 'react-native'
import { colors } from '../theme/platformTheme';

export const Background = () => {
    return (
        <View 
            style={{
                position: 'absolute',
                backgroundColor: colors.primary,
                top: -350,
                width: 1000,
                height: 1200,
                transform: [
                    { rotate: '-60deg' }
                ]
            }}
        />
    )
}
