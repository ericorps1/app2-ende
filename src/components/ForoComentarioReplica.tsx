import React from 'react'
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { colors, platformTheme } from '../theme/platformTheme';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { FotoPerfil } from './FotoPerfil';

interface PropsForoComentarioReplica {
    id_com: number;
    id_rep: number;
    nombre: string;
    fecha: string;
    foto: null | string;
    replica: string;
    onPressRespReplica: (ob:{id_com:number,nomCom:string}) => void;
    eliminarReplica: boolean;
    eliminarReplicaF: (id_rep:number) => void;
}

export const ForoComentarioReplica = ({ id_com, id_rep, nombre, foto, fecha, replica, onPressRespReplica, eliminarReplica, eliminarReplicaF }:PropsForoComentarioReplica) => {
  return (
    <View style={ styles.container }>
        <View style={ [platformTheme.fila, styles.filaTitle] }>
            <FotoPerfil foto={foto ?? undefined} nom_alu={nombre} style={styles.imgComentario} size={40}/>
            <Text style={ styles.nombreComentarista }>{ nombre }</Text>
            <View style={ [styles.iconRespuesta,platformTheme.fila,{flex: eliminarReplica ? 2 : 1}] }>
                <FontAwesome5 onPress={()=>onPressRespReplica({id_com,nomCom:nombre})} name='reply' style={ styles.respuestaIcon }/>
                {eliminarReplica && <FontAwesome5 onPress={()=>eliminarReplicaF(id_rep)} name='trash' style={ styles.eliminarIcon }/>}
            </View>
        </View>
        <View>
            <Text style={ styles.textRespuesta }>{ replica }</Text>
        </View>
        <View style={ styles.fechaRespuesta }>
            <Text style={ styles.fechaRespuestaText }>{ fecha }</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        marginLeft: 15,
    },
    filaTitle: {
        alignItems: 'center',
    },
    imgComentario: {
        width: 50,
        height: 50,
        borderRadius: 50,
        flex: 2,
    },
    nombreComentarista: {
        color: colors.darkBlue,
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 10,
        flex: 8,
    },
    iconRespuesta: {
        alignItems: 'flex-end',
        padding: 10,
    },
    respuestaIcon: {
        color: colors.darkBlue,
        fontSize: 20
    },
    eliminarIcon: {
        color: colors.error,
        fontSize: 20,
        marginLeft: 10,
    },
    textRespuesta: {
        color: colors.darkSilver,
        padding: 10,
        textAlign: 'justify'
    },
    fechaRespuesta: {
        alignItems: 'flex-end',
        paddingRight: 10
    },
    fechaRespuestaText: {
        fontSize: 12,
        color: colors.silver
    }
});
