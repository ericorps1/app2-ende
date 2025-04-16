import React, { useContext } from 'react'
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { colors, platformTheme } from '../theme/platformTheme';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { FotoPerfil } from './FotoPerfil';
import { ForoComentarioReplica } from './ForoComentarioReplica';
import { formatDateComentarios } from '../hooks/useFormats';
import { PropsForoComentario, ReplicasForo } from '../interfaces/appInterfaces';
import { AuthContext } from '../context/AuthContext';

export const ForoComentario = ({ id_com, nombre, comentario, foto, fecha, replicas, onPressResp, eliminar, eliminarComentario=()=>false, funcEliminarReplica=()=>false }:PropsForoComentario) => {
    const { data_alumno } = useContext( AuthContext );
    return (
        <View style={ styles.container }>
            <View style={ [platformTheme.fila, styles.filaTitle] }>
                <FotoPerfil foto={foto} nom_alu={nombre} style={styles.imgComentario} size={40}/>
                <Text style={ styles.nombreComentarista }>{ nombre }</Text>
                <View style={ {...styles.iconRespuesta, flex: eliminar ? 2 : 1} }>
                    <FontAwesome5 onPress={()=>onPressResp({id_com:id_com,nomCom:nombre})} name='reply' style={ styles.respuestaIcon }/>
                    {eliminar && <FontAwesome5 onPress={eliminarComentario} name='trash' style={ styles.eliminarIcon }/>}
                </View>
            </View>
            <View>
                <Text style={ styles.textRespuesta }>{ comentario }</Text>
            </View>
            <View style={ styles.fechaRespuesta }>
                <Text style={ styles.fechaRespuestaText }>{ fecha }</Text>
            </View>
            {
                replicas.length>0 && 
                    replicas.map(({id_rep,id_com,id_alu,nom_alu,app_alu,apm_alu,rep_rep,fot_alu,fec_rep}:ReplicasForo)=>{
                        const elimRep = data_alumno?.id_alu===id_alu;
                        return (
                            <ForoComentarioReplica 
                                key={id_rep}
                                id_rep={id_rep}
                                id_com={id_com}
                                nombre={nom_alu+' '+app_alu+' '+apm_alu}
                                replica={rep_rep}
                                foto={ fot_alu }
                                fecha={formatDateComentarios(fec_rep.replace(' ', 'T'))}
                                onPressRespReplica={onPressResp}
                                eliminarReplica={elimRep}
                                eliminarReplicaF={funcEliminarReplica}
                            />
                        )
                    })
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.softSilver,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
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
        ...platformTheme.fila,
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
