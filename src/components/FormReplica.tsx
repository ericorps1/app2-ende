import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { platformTheme, colors } from '../theme/platformTheme';

interface PropsFormReplica{
    loading: boolean;
    infoReplica: {
        id_com: number;
        nomCom: string;
    };
    guardarReplica: (id_com:number,replica:string) => void;
    msgError: string;
}

export const FormReplica = ({loading,infoReplica,guardarReplica,msgError}:PropsFormReplica) => {
    const [miReplica, setMiReplica] = useState(infoReplica.nomCom+':\n')
    return (
        <View style={ styles.containerReplica }>
            { msgError!=='' && <Text style={{...styles.titleReplica, color: colors.error, textAlign: 'center' }}>{ msgError }</Text> }
            <Text style={ styles.titleReplica }>Replicar a {infoReplica.nomCom}:</Text>
            <TextInput
                value={miReplica}
                multiline
                numberOfLines={6}
                editable
                onChangeText={text => setMiReplica(text)}
                style={styles.inputReplica}
                placeholder={'Responder el comentario de '+infoReplica.nomCom}
            />
            <View style={{alignItems: 'center'}}>
                <TouchableOpacity
                    style={styles.buttonGuardarReplica}
                    onPress={()=>guardarReplica(infoReplica.id_com,miReplica)}
                    disabled={loading}
                >
                    <Text style={styles.textBtnGuardarReplica}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerReplica: {
        backgroundColor: colors.softSilver,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 10,
        padding: 10
      },
      titleReplica: {
        color: colors.darkBlue,
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
      },
      inputReplica: {
        padding: 10,
        textAlignVertical: 'top',
        borderRadius: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        marginBottom: 10,
        borderColor: colors.darkBlue,
      },
      buttonGuardarReplica: {
        ...platformTheme.btn,
        ...platformTheme.btnDarkBlue,
        padding: 10,
        borderRadius: 10,
      },
      textBtnGuardarReplica: {
        color: 'white',
        fontSize: 16,
      },
});