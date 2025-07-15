import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { formatDate } from '../hooks/useFormats';
import { colors, platformTheme } from '../theme/platformTheme';
import { FotoPerfil } from './FotoPerfil';

interface PropsCardSalaPreview {
    id_sal: number;
    urlImg: string;
    styleImg: object;
    nombre: string;
    grupo: string;
    title: string;
    lastSms: string;
    lastFecMsg: string;
    onPressCardSala: (id_sal:number,des_sal:string) => void;
}

export const CardSalaPreview = ({id_sal,urlImg,styleImg,nombre,grupo,title,lastSms,lastFecMsg,onPressCardSala}:PropsCardSalaPreview) => {
    const fecLastMsg = lastFecMsg ? formatDate(lastFecMsg.split(' ')[0], '/') : null;
    return (
        <TouchableOpacity activeOpacity={0.5} style={styles.containerCard} onPress={()=>onPressCardSala(id_sal,nombre)}>
            <Image 
                source={{ uri: urlImg}}
                style={ styleImg }
            />
            <View style={styles.containerInfoSala}>
                <View style={platformTheme.fila}>
                    <Text style={styles.textTitleSala}>{title}</Text>
                    {grupo && <Text style={styles.textGrupo}>{grupo}</Text>}
                </View>
                <Text style={styles.textDescSala}>{nombre}</Text>
                {lastSms!=='' && <Text style={styles.textLastMsg}>{lastSms.slice(0, 35)}{lastSms.length>35 ? '...' : ''}</Text>}
            </View>
            {fecLastMsg &&
                <View style={styles.containerFecLastMsg}>
                    <Text style={styles.textFechaLastMsg}>{fecLastMsg}</Text>
                </View>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    containerCard: {
        ...platformTheme.fila,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        paddingVertical: 10,
        alignItems: 'center'
    },
    containerInfoSala: {
        alignContent: 'center',
        // alignItems: 'center',
        alignSelf: 'center',
        flex: 3,
    },
    textTitleSala: {
        backgroundColor: colors.yellow,
        borderRadius: 10,
        paddingHorizontal: 5,
        color: colors.darkBlue,
        fontWeight: 'bold',
        width: 'auto',
    },
    textGrupo: {
        backgroundColor: colors.blue,
        borderRadius: 10,
        paddingHorizontal: 5,
        color: 'white',
        fontWeight: 'bold',
        width: 'auto',
        marginLeft: 5
    },
    textDescSala: {
        color: colors.darkSilver,
        fontWeight: 'bold',
        fontSize: 18,
    },
    textLastMsg: {
        color: colors.darkSilver,
        fontWeight: 'bold',
        fontSize: 15
    },
    containerFecLastMsg: {
        flex: 1,
        alignItems: 'flex-end'
    },
    textFechaLastMsg: {
        color: colors.darkBlue,
        flex: 1,
        fontSize: 12
    }
});