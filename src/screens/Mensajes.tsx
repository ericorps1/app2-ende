import React, {useContext, useEffect, useState} from 'react'
import { ActivityIndicator, View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { CardSalaPreview } from '../components/CardSalaPreview';
import { FotoPerfil } from '../components/FotoPerfil';
import { AuthContext } from '../context/AuthContext';
import { colors, platformTheme } from '../theme/platformTheme';
import cafeApi from '../api/estudianteAPI';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

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
    type RootStackParamList = {
        ChatSala: { id_sal: number; des_sal: string };
        // add other routes here if needed
    };
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ChatSala'>>();
    // const navigation = useNavigation();

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
    
    useEffect(() => {
        if (allSalas.length > 0) {
            aplicarFiltro(searchBarValue);
        }
    }, [allSalas]);
    
    const getSalasUsuario = async () => {
        const {data} = await cafeApi.get(`/sala/salasxAlumno/${data_alumno?.id_alu}/${data_alumno?.id_ram3}`);
        if(data.trans){
            setAllSalas(data.data);
        }
    }

    // Función auxiliar para aplicar el filtro
    const aplicarFiltro = (value: string) => {
      if (!value || value.trim() === '') {
        // Si no hay búsqueda, mostrar todas las salas
        setSalas(allSalas);
        return;
      }

      const searchLower = value.toLowerCase();
      
      const dataFilter = allSalas.filter((sala: listSala) => {
        // Validate each property before calling toLowerCase
        const descSala = sala.desc_sala?.toLowerCase() || '';
        const nomSal = sala.nom_sal?.toLowerCase() || '';
        const lastMenMen = sala.last_men_men?.toLowerCase() || '';
        const lastNomUsu = sala.last_nom_usu?.toLowerCase() || '';

        // Search in all properties (as LIKE of SQL)
        return descSala.includes(searchLower) ||
          nomSal.includes(searchLower) ||
          lastMenMen.includes(searchLower) ||
          lastNomUsu.includes(searchLower);
      });
      
      setSalas(dataFilter);
    }

    const buscarSalas = (value: string) => {
        setSearchBarValue(value);
        aplicarFiltro(value);
    }

    const pressSala = (id_sal:number, des_sal:string) => {
        navigation.navigate('ChatSala', {id_sal,des_sal})
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
                    <Text style={styles.textNoSala}>
                        {searchBarValue ? 'No se encontraron salas con ese criterio.' : 'No tienes salas disponibles.'}
                    </Text>
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
        textAlign: 'center',
        marginTop: 20,
        color: colors.darkBlue,
    }
});