import React from 'react'
import { Text, View, ColorValue, StyleSheet, TouchableOpacity, Button } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'
import { colors, platformTheme } from '../theme/platformTheme'

interface RecursoTeoricoProps{
    icon: string;
    text: string;
    iconColor: ColorValue;
    onPress: () => void;
}

export const RecursoTeorico = ({icon,text,iconColor,onPress}:RecursoTeoricoProps) => {
    return (
        <TouchableOpacity style={ styles.container } onPress={onPress}>
            <FontAwesome5Icon 
                name={icon}
                color={iconColor}
                style={ styles.icon }
            />
            <Text style={ styles.text }>
                { text }
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        ...platformTheme.shadowBox,
        ...platformTheme.fila,
        backgroundColor: colors.softSilver,
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        marginRight: 10
    },
    icon: {
        fontSize: 40,
        width: 50,
        textAlign: 'center'
    },
    text: {
        flex: 1,
        padding: 10,
        fontSize: 15,
        color: colors.darkBlue
    }
});
