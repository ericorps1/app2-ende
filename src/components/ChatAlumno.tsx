import React, {useState,useEffect,useContext} from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { colors, platformTheme } from '../theme/platformTheme';
import { FotoPerfil } from './FotoPerfil';
import cafeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { useRef } from 'react';
import { MensajesChatAlumno } from './MensajesChatAlumno';

export const ChatAlumno = () => {
    const [visibleChat, setVisibleChat] = useState(false);
    const [idSala, setIdSala] = useState(0);
    const { data_alumno } = useContext( AuthContext );
    const { id_pro, nom_pro, fot_emp, tipo, id_sub_hor, materia } = useAppSelector(state => state.datachat);
    useEffect(() => {
        getSala();
    }, [])
    
    const getSala = async() => {
        // console.log(id_sub_hor,data_alumno?.id_alu,id_pro);
        const {data} = await cafeApi.get(`sala/salaEstudianteProfesor/${data_alumno?.id_alu}/${id_pro}`);
        if(data.trans){
            if(data.data.length){
                setIdSala(data.data[0].id_sal);
            }
        }
    }
    
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                activeOpacity={0.5}
                style={styles.containerMinimize} 
                onPress={()=>setVisibleChat(!visibleChat)}
            >
                <FotoPerfil 
                    foto={fot_emp}
                    nom_alu={nom_pro}
                    size={35}
                    style={styles.fotoProfesorMin}
                />
                <View style={styles.containerName}>
                    <Text style={styles.textName}>{nom_pro}</Text>
                    <Text style={styles.textRol}>{tipo}</Text>
                </View>
            </TouchableOpacity>
            {
                visibleChat && <View style={styles.containerChatHistory}>
                    <MensajesChatAlumno 
                        id_sal={idSala}
                        id_pro={id_pro}
                        welcomeMsg={<View style={platformTheme.fila}>
                                <FotoPerfil 
                                    foto={fot_emp}
                                    nom_alu={nom_pro}
                                    size={80}
                                    style={styles.fotoProfesorMax}
                                />
                                <View style={styles.containerWelcomeMsg}>
                                    <Text style={styles.textWelcomeTitle}>
                                        Soy tu profesor de {materia}, bienvenido a ENDE Ecatepec.
                                    </Text>
                                    <Text style={styles.textWelcomeDescription}>
                                        Cualquier duda, mándame un mensaje y a la brevedad te contesto ;
                                    </Text>
                                </View>
                            </View>
                        }
                    />
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...platformTheme.shadowBox,
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 999,
        borderTopStartRadius: 5,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        backgroundColor: 'white',
        width: '100%',
    },
    containerMinimize: {
        ...platformTheme.fila,
        marginHorizontal: 10,
    },
    fotoProfesorMin: {
        borderRadius: 30,
        marginVertical: 10,
        marginRight: 10,
        width: 50,
        height: 50,
    },
    containerName: {
        alignSelf: 'center'
    },
    textName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkBlue
    },
    textRol: {
        fontSize: 15,
    },
    containerChatHistory: {
        borderTopColor: colors.darkSilver,
        padding: 10,
    },
    textMsgFile: {
        color: colors.blue
    },
    fotoProfesorMax: {
        borderRadius: 10,
        marginVertical: 10,
        marginRight: 10,
        width: 60,
        height: 80,
    },
    containerWelcomeMsg: {
        flex: 1,
        paddingTop: 10
    },
    textWelcomeTitle: {
        color: colors.darkBlue,
        fontWeight: 'bold'
    },
    textWelcomeDescription: {
        fontSize: 12
    }
});