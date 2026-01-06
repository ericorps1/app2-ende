import React, {useContext} from 'react'
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoadingScreen = ({text='Cargando'}) => {
    const { colors: themeColors } = useTheme();
    const { token, logOut } = useContext( AuthContext );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ActivityIndicator 
                size="large"
                color={themeColors.textPrimary}
            />
            <Text style={[styles.text, { color: themeColors.textSecondary }]}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
    },
});