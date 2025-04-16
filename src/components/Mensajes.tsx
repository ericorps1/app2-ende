import React, {useContext, useEffect, useState} from 'react'
import { ActivityIndicator, View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { CardSalaPreview } from '../components/CardSalaPreview';
import { FotoPerfil } from '../components/FotoPerfil';
import { AuthContext } from '../context/AuthContext';
import { colors, platformTheme } from '../theme/platformTheme';
import cafeApi from '../api/estudianteAPI';
import { useNavigation } from '@react-navigation/core';

interface listSala {
    id_sal: number;
    desc_sala: string;
    nom_sal: string;
    last_men_men: string;
    last_tip_men: "Alumno" | "Profesor" | "Admin";
    last_use_men: number;
    last_nom_usu: string;
    last_hor_men: string;
}

export const Mensajes = () => {
    const { data_alumno } = useContext( AuthContext );
    const [allSalas, setAllSalas] = useState([]);
    const [salas, setSalas] = useState([]);
    const [searchBarValue, setSearchBarValue] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        getSalasUsuario();
        const intervalSalas = setInterval(()=>{
            getSalasUsuario();
            // console.log('recargando salas');
        },5000);
        return () => {
            setSalas([]);
            setAllSalas([]);
            clearInterval(intervalSalas);
        }
    }, [])
    
    const getSalasUsuario = async () => {
        const {data} = await cafeApi.get(`/sala/salasxAlumno/${data_alumno?.id_alu}/${data_alumno?.id_ram3}`);
        if(data.trans){
            setAllSalas(data.data);
            setSalas(data.data);
        }
    }

    const buscarSalas = (value:string) => {
        setSearchBarValue(value);
        const dataFilter = allSalas.filter((sala:listSala)=>sala.desc_sala.toLowerCase().includes(value.toLowerCase()));
        setSalas(dataFilter);
    }

    const pressSala = (id_sal:number, des_sal:string) => {
        navigation.navigate('ChatSala', {id_sal,des_sal})
        // console.log('presionando la sala con id '+id_sal, des_sal);
        // getSalasUsuario();
    }
    return (
        <View style={{flex: 1}}>
            <View style={styles.containerInfoUserSala}>
                <View style={styles.containerFotoMyUser}>
                    <FotoPerfil 
                        foto={data_alumno?.fot_alu ? data_alumno?.fot_alu : ''}
                        nom_alu={data_alumno?.nom_alu ? data_alumno?.nom_alu : 'N N'}
                        size={50}
                        style={styles.fotoMyUser}
                    />
                </View>
                <Text style={styles.textNameUser}>
                    {data_alumno?.nom_alu}
                </Text>
            </View>
            <Searchbar 
                placeholder="Buscar salas"
                onChangeText={buscarSalas}
                value={searchBarValue}
                iconColor={colors.blue}
                style={styles.searchBar}
            />
            <ScrollView style={styles.scrollView}>
            {
                salas.length > 0 ? 
                    salas.map((sala:listSala) => 
                        <CardSalaPreview
                            key={sala.id_sal}
                            id_sal={sala.id_sal}
                            urlImg={sala.nom_sal ? 'https://plataforma.ahjende.com/img/grupo.jpg' : 'https://plataforma.ahjende.com/img/usuario2.jpg'}
                            styleImg={styles.imgSala}
                            nombre={sala.desc_sala}
                            grupo={sala.nom_sal}
                            title={sala.nom_sal ? 'Grupal' : 'Capacitador'}
                            lastSms={sala.last_nom_usu ? `${sala.last_nom_usu} dice: ${sala.last_men_men}` : ''}
                            lastFecMsg={sala.last_hor_men}
                            onPressCardSala={pressSala}
                        />
                    )
                :
                    <Text style={styles.textNoSala}>No se encontró ninguna sala.</Text>
            }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    containerInfoUserSala: {
        ...platformTheme.fila,
        backgroundColor: colors.blue,
        alignItems: 'center'
    },
    searchBar: {
        marginTop: 10,
        borderRadius: 50,
        marginHorizontal: 10,
        marginBottom: 20,
    },
    scrollView: {
        paddingBottom: 30,
    },
    containerFotoMyUser: {
        flex: 2,
        margin: 10,
        alignItems: 'center',
        borderRadius: 30
    },
    fotoMyUser: {
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 30,
    },
    textNameUser: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        flex: 10
    },
    imgSala: {
        width:50,
        height:50,
        borderRadius:30,
        borderWidth:1,
        borderColor:'black',
        marginRight:10,
    },
    textNoSala: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center'
    }
});