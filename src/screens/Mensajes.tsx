import React, {useContext, useEffect, useState} from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { CardSalaPreview } from '../components/CardSalaPreview';
import { FotoPerfil } from '../components/FotoPerfil';
import { AuthContext } from '../context/AuthContext';
import cafeApi from '../api/estudianteAPI';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

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
    const { colors: themeColors } = useTheme();
    const { data_alumno } = useContext( AuthContext );
    const [allSalas, setAllSalas] = useState([]);
    const [salas, setSalas] = useState([]);
    const [searchBarValue, setSearchBarValue] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    
    type RootStackParamList = {
        ChatSala: { id_sal: number; des_sal: string };
    };
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ChatSala'>>();

    useEffect(() => {
        getSalasUsuario();
        const intervalSalas = setInterval(() => {
            getSalasUsuario();
        }, 5000);
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

    const onRefresh = async () => {
        setRefreshing(true);
        await getSalasUsuario();
        setRefreshing(false);
    };
    
    const getSalasUsuario = async () => {
        const {data} = await cafeApi.get(`/sala/salasxAlumno/${data_alumno?.id_alu}/${data_alumno?.id_ram3}`);
        if(data.trans){
            setAllSalas(data.data);
        }
    }

    const aplicarFiltro = (value: string) => {
        if (!value || value.trim() === '') {
            setSalas(allSalas);
            return;
        }

        const searchLower = value.toLowerCase();
        
        const dataFilter = allSalas.filter((sala: listSala) => {
            const descSala = sala.desc_sala?.toLowerCase() || '';
            const nomSal = sala.nom_sal?.toLowerCase() || '';
            const lastMenMen = sala.last_men_men?.toLowerCase() || '';
            const lastNomUsu = sala.last_nom_usu?.toLowerCase() || '';

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
        navigation.navigate('ChatSala', {id_sal, des_sal})
    }

    const salasGrupales = salas.filter((sala: listSala) => sala.nom_sal);
    const salasPrivadas = salas.filter((sala: listSala) => !sala.nom_sal);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={10}
                        tintColor={themeColors.textPrimary}
                        colors={[themeColors.textPrimary]}
                    />
                }
            >
                <View style={[styles.heroSection, { 
                    backgroundColor: themeColors.backgroundCard,
                    borderBottomColor: themeColors.borderGray 
                }]}>
                    <View style={styles.heroContent}>
                        <FotoPerfil 
                            foto={data_alumno?.fot_alu ? data_alumno?.fot_alu : ''}
                            nom_alu={data_alumno?.nom_alu ? data_alumno?.nom_alu : 'N N'}
                            size={56}
                            style={styles.heroAvatar}
                        />
                        <View style={styles.heroInfo}>
                            <Text style={[styles.heroGreeting, { color: themeColors.textPrimary }]}>
                                Hola, {data_alumno?.nom_alu?.split(' ')[0]}
                            </Text>
                            <Text style={[styles.heroSubtitle, { color: themeColors.textSecondary }]}>
                                {salas.length} {salas.length === 1 ? 'conversación activa' : 'conversaciones activas'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.searchSection, { backgroundColor: themeColors.backgroundCard }]}>
                    <View style={[styles.searchContainer, { backgroundColor: themeColors.backgroundGray }]}>
                        <Icon name="magnify" size={20} color={themeColors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: themeColors.textPrimary }]}
                            placeholder="Buscar salas, mensajes..."
                            placeholderTextColor={themeColors.textTertiary}
                            value={searchBarValue}
                            onChangeText={buscarSalas}
                        />
                        {searchBarValue !== '' && (
                            <TouchableOpacity 
                                onPress={() => buscarSalas('')} 
                                activeOpacity={0.7}
                                style={styles.clearButton}
                            >
                                <Icon name="close-circle" size={20} color={themeColors.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {salas.length > 0 ? (
                    <>
                        {salasGrupales.length > 0 && (
                            <View style={[styles.section, { backgroundColor: themeColors.backgroundCard }]}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Icon name="account-group" size={16} color={themeColors.textSecondary} style={styles.sectionIcon} />
                                        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Salas grupales</Text>
                                    </View>
                                    <View style={[styles.countBadge, { backgroundColor: themeColors.backgroundGray }]}>
                                        <Text style={[styles.countBadgeText, { color: themeColors.textSecondary }]}>{salasGrupales.length}</Text>
                                    </View>
                                </View>
                                {salasGrupales.map((sala: listSala) => 
                                    <CardSalaPreview
                                        key={sala.id_sal}
                                        id_sal={sala.id_sal}
                                        urlImg='https://plataforma.ahjende.com/img/grupo.jpg'
                                        styleImg={styles.imgSala}
                                        nombre={sala.nom_sal}
                                        grupo={sala.nom_sal}
                                        title='Grupal'
                                        lastSms={sala.last_nom_usu ? `${sala.last_nom_usu}: ${sala.last_men_men}` : ''}
                                        lastFecMsg={sala.last_hor_men}
                                        onPressCardSala={pressSala}
                                    />
                                )}
                            </View>
                        )}

                        {salasPrivadas.length > 0 && (
                            <View style={[styles.section, { backgroundColor: themeColors.backgroundCard }]}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Icon name="account" size={16} color={themeColors.textSecondary} style={styles.sectionIcon} />
                                        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Profesores</Text>
                                    </View>
                                    <View style={[styles.countBadge, { backgroundColor: themeColors.backgroundGray }]}>
                                        <Text style={[styles.countBadgeText, { color: themeColors.textSecondary }]}>{salasPrivadas.length}</Text>
                                    </View>
                                </View>
                                {salasPrivadas.map((sala: listSala) => 
                                    <CardSalaPreview
                                        key={sala.id_sal}
                                        id_sal={sala.id_sal}
                                        urlImg='https://plataforma.ahjende.com/img/usuario2.jpg'
                                        styleImg={styles.imgSala}
                                        nombre={sala.desc_sala}
                                        grupo={sala.nom_sal}
                                        title='Profesor'
                                        lastSms={sala.last_nom_usu ? `${sala.last_nom_usu}: ${sala.last_men_men}` : ''}
                                        lastFecMsg={sala.last_hor_men}
                                        onPressCardSala={pressSala}
                                    />
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Icon 
                            name={searchBarValue ? "message-off-outline" : "message-outline"} 
                            size={64} 
                            color={themeColors.borderGray}
                        />
                        <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
                            {searchBarValue ? 'No se encontraron salas' : 'No tienes conversaciones'}
                        </Text>
                        <Text style={[styles.emptyStateSubtext, { color: themeColors.textTertiary }]}>
                            {searchBarValue ? 'Intenta con otro término de búsqueda' : 'Tus mensajes aparecerán aquí'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomWidth: 1,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    heroInfo: {
        marginLeft: 16,
        flex: 1,
    },
    heroGreeting: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
        fontFamily: 'NotoColorEmoji',
    },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 0,
        fontFamily: 'NotoColorEmoji',
    },
    clearButton: {
        padding: 4,
    },
    section: {
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    imgSala: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
        marginTop: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});