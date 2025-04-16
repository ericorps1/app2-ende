import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native';
// import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { platformTheme, colors } from '../theme/platformTheme';

interface PropsBackButtonNavigation {
    onPressBack: () => void;
    title: string;
}

export const BackButtonNavigation = ({onPressBack,title}:PropsBackButtonNavigation) => {
  return (
    <>
        <View style={ { ...platformTheme.fila, marginBottom: 10 } }>
            {/* <FontAwesome5Icon 
                style={ platformTheme.iconBack } 
                onPress={ onPressBack } 
                size={ 30 } 
                name={'arrow-left'} 
                color={colors.darkBlue} 
            /> */}
            <Button
                onPress={ onPressBack }
                title='Atras'
                color={colors.darkBlue}
                accessibilityLabel='Atras'
            />
            <Text 
                style={{
                    ...styles.title,
                    flex: 8,
                    fontSize: 20,
                    marginRight: 10
                } }
            >{ title }</Text>
        </View>
    </>
  )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        color: colors.darkBlue
    },
});