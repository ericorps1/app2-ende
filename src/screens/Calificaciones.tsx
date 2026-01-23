import React, { useContext, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, Alert, TextInput, Platform, Dimensions } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import cafeApi from '../api/estudianteAPI'; 
import { Table, Row } from 'react-native-table-component';
import { LoadingScreen } from './LoadingScreen';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate } from '../hooks/useFormats'; 

// Ancho de la pantalla
const screenWidth = Dimensions.get('window').width;
// CALCULAMOS EL ANCHO INTERNO ÚTIL DE LA TARJETA (screenWidth - 16*2 margin - 16*2 padding)
const CARD_CONTENT_WIDTH = screenWidth - 64; 
const CALIF_WIDTH = 70;
// El ancho restante es para la columna de Materia
const MATERIA_WIDTH = CARD_CONTENT_WIDTH - (CALIF_WIDTH * 2); 

// --- INTERFACES ---
interface MateriaRaw {
  nom_mat: string;
  cic_mat: string;
  fin_cal: string | number | null; 
  ext_cal: string | number | null;
  nom_ram: string;
  gra_ram: string;
  nom_gen: string;
  ini_gen: string;
  fin_gen: string;
}

interface ApiResponse {
    trans: boolean;
    msg: string;
    data: MateriaRaw[];
}

interface CalificacionMateria {
  nom_mat: string;
  calificacion_extra: number | null;
  calificacion_final: number | null;
  estatus: 'aprobada' | 'reprobada' | 'pendiente'; 
}

interface CicloAgrupado {
  ciclo_nombre: string;
  ciclo_numero: string; 
  materias: CalificacionMateria[];
}

interface RegistroCalificaciones {
  programa_nombre: string;
  programa_modalidad: string;
  generacion_grupo: string;
  generacion_inicio: string;
  generacion_fin: string;
  ciclos: CicloAgrupado[];
}

// --------------------------------------------------------

export const Calificaciones = () => {
  const { colors: themeColors } = useTheme();
  const { data_alumno } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataCalificaciones, setDataCalificaciones] = useState<RegistroCalificaciones[]>([]);
  const [promedioGeneral, setPromedioGeneral] = useState<number>(0);
  const [totalMaterias, setTotalMaterias] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    return bg.includes('#121212') || cardBg.includes('#1e1e1e') || bg.includes('#000000');
  })();


  useEffect(() => {
    getCalificaciones();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCalificaciones();
    setRefreshing(false);
    setSearchText(''); 
  };
  
  // --- HELPERS (CONVERSIÓN Y FORMATO) ---
  const convertToNumber = (value: string | number | null | undefined): number | null => {
      if (value === null || value === undefined || value === '') {
          return null;
      }
      const num = parseFloat(value as string);
      return isNaN(num) ? null : num;
  };
  
  const getFormattedValue = (value: number | null): string | null => {
      if (typeof value === 'number' && !isNaN(value)) {
          if (value % 1 === 0) return value.toString();
          return value.toFixed(1);
      }
      return null;
  };
  
  const getMateriaStatus = (finalCal: number | null): 'aprobada' | 'reprobada' | 'pendiente' => {
      // Usamos 8.0 como corte para el estatus 'aprobada' si fuera necesario, aunque la visualización se basa en la nueva lógica de color
      if (finalCal === null || finalCal === 0) return 'pendiente';
      return finalCal >= 7.0 ? 'aprobada' : 'reprobada';
  };


  // --- LÓGICA DE PROCESAMIENTO (AGRUPAR POR CICLO) ---
  const procesarYAgruparDatos = (data: MateriaRaw[]) => {
    
    if (data.length === 0) {
        return { agrupado: [], promedio: 0, totalMaterias: 0 };
    }

    const primeraMateria = data[0];
    const { nom_ram, gra_ram, nom_gen, ini_gen, fin_gen } = primeraMateria;
    
    const ciclosMap = data.reduce((acc, current) => {
      const rawCiclo = current.cic_mat ? current.cic_mat.toString() : '0';
      const cicloKey = `${rawCiclo}`; 

      if (!acc[cicloKey]) {
        acc[cicloKey] = { ciclo_nombre: `${rawCiclo}º SEMESTRE`, ciclo_numero: rawCiclo, materias: [] };
      }

      const finalCal = convertToNumber(current.fin_cal);
      const extraCal = convertToNumber(current.ext_cal);
      const estatus = getMateriaStatus(finalCal);

      acc[cicloKey].materias.push({
        nom_mat: current.nom_mat,
        calificacion_extra: extraCal,
        calificacion_final: finalCal,
        estatus: estatus,
      });

      return acc;
    }, {} as { [key: string]: CicloAgrupado });

    const ciclosArray = Object.values(ciclosMap).sort((a, b) => {
        const numA = parseInt(a.ciclo_numero, 10);
        const numB = parseInt(b.ciclo_numero, 10);
        return numA - numB;
    });

    const registroAgrupado: RegistroCalificaciones = {
      programa_nombre: nom_ram,
      programa_modalidad: gra_ram,
      generacion_grupo: nom_gen,
      generacion_inicio: ini_gen,
      generacion_fin: fin_gen,
      ciclos: ciclosArray,
    };

    const todasLasMaterias = ciclosArray.flatMap(ciclo => ciclo.materias);
    const calificacionesValidas = todasLasMaterias.filter(
      cal => cal.calificacion_final !== null && cal.calificacion_final > 0
    );
    
    let suma = 0;
    calificacionesValidas.forEach(cal => {
        suma += cal.calificacion_final || 0;
    });

    const promedio = calificacionesValidas.length > 0 ? suma / calificacionesValidas.length : 0;
    
    return { 
        agrupado: [registroAgrupado], 
        promedio, 
        totalMaterias: todasLasMaterias.length,
    };
  };

  const getCalificaciones = async () => {
    setLoading(true);
    
    const id_alu = data_alumno?.id_alu;
    const id_alu_ram = data_alumno?.id_alu_ram;
    const endpoint = `calificacion/calificacionesxmodalidad/${id_alu}/${id_alu_ram}`;

    try {
        const response = await cafeApi.get<ApiResponse>(endpoint); 
        const dataRaw = response.data.data; 
        
        if (response.data.trans === false) {
             Alert.alert('Error del Servidor', response.data.msg);
             setLoading(false);
             return;
        }

        const dataArray = Array.isArray(dataRaw) ? dataRaw : [];
        
        const { agrupado, promedio, totalMaterias } = procesarYAgruparDatos(dataArray);

        setDataCalificaciones(agrupado);
        setPromedioGeneral(promedio);
        setTotalMaterias(totalMaterias);
        
    } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar las calificaciones.');
        setDataCalificaciones([]); 
        setPromedioGeneral(0);
        setTotalMaterias(0);
    }
    setLoading(false);
  };
  
  // --- LÓGICA DE FILTRADO GLOBAL (useMemo para optimizar) ---
  const registroActual = dataCalificaciones.length > 0 ? dataCalificaciones[0] : null;
  const ciclos = registroActual ? registroActual.ciclos : [];
  
  // Filtramos todas las materias de todos los ciclos
  const ciclosFiltrados = useMemo(() => {
    if (!registroActual) return [];
    
    const lowerSearchText = searchText.toLowerCase();
    
    // Si no hay texto de búsqueda, devolvemos todos los ciclos
    if (lowerSearchText.length === 0) return ciclos;
    
    // Si hay texto, filtramos las materias dentro de cada ciclo
    const filteredCiclos = ciclos.map(ciclo => {
        const materiasFiltradas = ciclo.materias.filter(materia => 
            materia.nom_mat.toLowerCase().includes(lowerSearchText)
        );
        // Devolvemos el ciclo con solo las materias que coinciden
        return {
            ...ciclo,
            materias: materiasFiltradas,
        };
    }).filter(ciclo => ciclo.materias.length > 0); // Eliminamos ciclos vacíos

    return filteredCiclos;

  }, [ciclos, searchText]); 
  
  // --- HELPERS DE ESTILOS (Colores y Badges) ---

  /**
   * NUEVA LÓGICA DE COLOR
   * < 6.0: Rojo (Reprobado)
   * 6.0 a 7.9: Amarillo (Regular)
   * >= 8.0: Verde (Sobresaliente)
   */

  const getPromedioColor = (promedio: number) => {
    if (promedio === 0) return isDarkTheme ? '#666' : themeColors.textTertiary;
    
    if (promedio >= 8.0) {
        return isDarkTheme ? '#A8C4A8' : '#34C759'; // Verde
    } else if (promedio >= 6.0 && promedio < 8.0) {
        return isDarkTheme ? '#D4BDA0' : '#FF9500'; // Amarillo
    } else {
        return isDarkTheme ? '#D0A8A0' : '#FF3B30'; // Rojo
    }
  };

  const getCalificacionBadgeStyle = (calificacion: number) => {
    
    if (calificacion >= 8.0) {
      return isDarkTheme 
        ? { bg: '#2D352E', color: '#A8C4A8' } // Verde Oscuro
        : { bg: '#E8F5E9', color: '#34C759' }; // Verde Claro
    } else if (calificacion >= 6.0 && calificacion < 8.0) {
      return isDarkTheme 
        ? { bg: '#38332D', color: '#D4BDA0' } // Amarillo Oscuro
        : { bg: '#FFFDE7', color: '#FF9500' }; // Amarillo Claro
    } else {
      return isDarkTheme 
        ? { bg: '#382E2D', color: '#D0A8A0' } // Rojo Oscuro
        : { bg: '#FFEBEE', color: '#FF3B30' }; // Rojo Claro
    }
  };

  const getPendingBadgeStyle = () => {
    if (isDarkTheme) {
      return { bg: '#2B2B2B', color: '#A8A8A8', text: 'Pend.' }; 
    } else {
      return { bg: themeColors.backgroundGray, color: themeColors.textSecondary, text: 'Pend.' }; 
    }
  };
  
  // --- COMPONENTE DE CELDA DE CALIFICACIÓN REUTILIZABLE ---
  const CalificacionCell = (materia: CalificacionMateria, type: 'final' | 'extra', width: number) => {
    const calificacion = type === 'final' ? materia.calificacion_final : materia.calificacion_extra;
    const formattedValue = getFormattedValue(calificacion);
    const pendingStyle = getPendingBadgeStyle();

    const isPending = formattedValue === null;
    
    let styleProps: any;
    if (isPending) {
      // Si está pendiente, usa el estilo gris
      styleProps = { bg: pendingStyle.bg, color: pendingStyle.color, text: type === 'final' ? pendingStyle.text : '-' };
    } else {
      // Si hay calificación, usa la nueva lógica de color
      styleProps = getCalificacionBadgeStyle(calificacion as number);
      styleProps.text = formattedValue;
    }

    return (
        <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
            <View style={[styles.calificacionBadge, { backgroundColor: styleProps.bg }]}>
                <Text style={[styles.calificacionText, { color: styleProps.color }]}>
                    {styleProps.text}
                </Text>
            </View>
        </View>
    );
  };
  // --------------------------------------------------------

  // Definición de la estructura de la tabla
  const tableHead = ['Materia', 'Extra', 'Final'];
  const widthArr = [MATERIA_WIDTH, CALIF_WIDTH, CALIF_WIDTH]; 

  if (loading) {
    return <LoadingScreen text="Cargando historial de calificaciones..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeColors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={themeColors.textPrimary}
          colors={[themeColors.textPrimary]}
        />
      }
    >
      
      {/* --- DASHBOARD SIMPLIFICADO --- */}
      <View style={styles.dashboardContainer}>
        {/* Total Asignaturas */}
        <View style={[
          styles.dashboardCard, 
          { backgroundColor: themeColors.backgroundCard }
        ]}>
          <Text style={[styles.dashboardValue, { color: themeColors.textPrimary }]}>
            {totalMaterias}
          </Text>
          <Text style={[styles.dashboardLabel, { color: themeColors.textSecondary }]}>Asignaturas</Text>
        </View>
        
        {/* Promedio General */}
        <View style={[
          styles.dashboardCard, 
          { backgroundColor: themeColors.backgroundCard }
        ]}>
          <Text style={[styles.dashboardValue, { color: getPromedioColor(promedioGeneral) }]}>
            {promedioGeneral > 0 ? promedioGeneral.toFixed(2) : 'N/A'}
          </Text>
          <Text style={[styles.dashboardLabel, { color: themeColors.textSecondary }]}>Promedio General</Text>
        </View>
      </View>
      {/* --------------------------- */}


      {registroActual ? (
          <View style={[
            styles.mainSection, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              borderWidth: 1
            }
          ]}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Historial de Calificaciones
            </Text>
            
            {/* CABECERA DE PROGRAMA/GENERACIÓN */}
            <View style={styles.programaHeaderContainer}>
                <View style={styles.programaHeaderRow}>
                    <Text style={[styles.headerProgramLabel, { color: themeColors.textSecondary }]}>Programa:</Text>
                    <Text style={[styles.headerProgramValue, { color: themeColors.textPrimary }]}>
                        {registroActual.programa_nombre} ({registroActual.programa_modalidad})
                    </Text>
                </View>
                <View style={styles.programaHeaderRow}>
                    <Text style={[styles.headerProgramLabel, { color: themeColors.textSecondary }]}>Grupo:</Text>
                    <Text style={[styles.headerProgramValue, { color: themeColors.textPrimary }]}>
                        {registroActual.generacion_grupo}
                    </Text>
                </View>
                <View style={styles.programaHeaderRow}>
                    <Text style={[styles.headerProgramLabel, { color: themeColors.textSecondary }]}>Periodo:</Text>
                    <Text style={[styles.headerProgramValue, { color: themeColors.textPrimary }]}>
                        {formatDate(registroActual.generacion_inicio, '/')} - {formatDate(registroActual.generacion_fin, '/')}
                    </Text>
                </View>
            </View>
            <View style={[styles.separator, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#E0E0E0' }]} />
            
            
            {/* --- BUSCADOR --- */}
            <View style={styles.searchContainer}>
                <View style={[
                    styles.searchInputWrapper, 
                    { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
                ]}>
                    <Icon 
                        name="magnify" 
                        size={20} 
                        color={themeColors.textTertiary} 
                        style={styles.searchIcon} 
                    />
                    <TextInput
                        style={[styles.searchInput, { color: themeColors.textPrimary }]}
                        placeholder="Buscar materia en todos los semestres..."
                        placeholderTextColor={themeColors.textTertiary}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>
            
            {/* --- TABLA COMPLETA AGRUPADA POR CICLO --- */}
            {ciclosFiltrados.length > 0 ? (
                <View style={[styles.tableContainer]}> 
                    <ScrollView 
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        style={styles.tableBodyScroll}
                    >
                        {ciclosFiltrados.map((ciclo, cicloIndex) => (
                            <View key={`ciclo-${ciclo.ciclo_numero}`} style={{ marginBottom: 20 }}>
                                
                                {/* Encabezado de Ciclo (Semestre) */}
                                <Text style={[
                                    styles.cicloHeaderTitle, 
                                    { 
                                        color: themeColors.textPrimary, 
                                        backgroundColor: isDarkTheme ? '#333' : themeColors.backgroundGray 
                                    }
                                ]}>
                                    {ciclo.ciclo_nombre}
                                </Text>

                                {/* Encabezado de Tabla (Materia, Extra, Final) */}
                                <Table borderStyle={{ borderWidth: 0 }}>
                                    <Row
                                        data={tableHead}
                                        widthArr={widthArr}
                                        style={[
                                            styles.header, 
                                            { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.textPrimary }
                                        ]}
                                        textStyle={StyleSheet.flatten([
                                            styles.headerText, 
                                            { color: isDarkTheme ? '#D0D0D0' : themeColors.backgroundCard }
                                        ])}
                                    />
                                </Table>

                                {/* Filas de Materias */}
                                <Table borderStyle={{ borderWidth: 0 }}>
                                    {ciclo.materias.map((materia, matIndex) => {
                                        const rowData = [
                                            // Materia Cell (View + Text)
                                            <View key={`materia-${matIndex}`} style={[styles.materiaCell, { width: widthArr[0] }]}>
                                                <Text style={[styles.materiaNameText, { color: themeColors.textPrimary }]}>
                                                    {materia.nom_mat}
                                                </Text>
                                            </View>,
                                            
                                            // Extra Cell (View con Badge)
                                            CalificacionCell(materia, 'extra', widthArr[1]),
                                            
                                            // Final Cell (View con Badge)
                                            CalificacionCell(materia, 'final', widthArr[2])
                                        ];
                                        return (
                                            <Row
                                                key={matIndex}
                                                data={rowData}
                                                widthArr={widthArr}
                                                style={[
                                                    styles.row,
                                                    { 
                                                        backgroundColor: matIndex % 2 === 0 
                                                            ? (isDarkTheme ? '#1E1E1E' : themeColors.backgroundGray)
                                                            : themeColors.backgroundCard,
                                                        borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : '#F0F0F0'
                                                    },
                                                ]}
                                            />
                                        );
                                    })}
                                </Table>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyStateContainer}>
                    <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
                        {searchText.length > 0 
                            ? `No se encontraron resultados para "${searchText}" en ningún semestre.` 
                            : 'No hay calificaciones disponibles.'
                        }
                    </Text>
                </View>
            )}
          </View>
      ) : (
        <View style={styles.emptyState}>
            <Icon 
                name="clipboard-text-outline" 
                size={64} 
                color={isDarkTheme ? '#444' : themeColors.borderGray} 
            />
            <Text style={[styles.emptyStateText, { color: themeColors.textTertiary, fontSize: 16 }]}>
                No hay información de calificaciones registrada
            </Text>
        </View>
      )}
    </ScrollView>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dashboardCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 110,
  },
  dashboardValue: {
    fontSize: 24, 
    fontWeight: '700',
    marginBottom: 4,
  },
  dashboardLabel: {
    fontSize: 11, 
    fontWeight: '600',
    textAlign: 'center',
  },
  mainSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programaHeaderContainer: {
    marginBottom: 10,
  },
  programaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerProgramLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    width: '25%', 
  },
  headerProgramValue: {
    fontSize: 13,
    fontWeight: 'bold',
    width: '75%', 
  },
  separator: {
    height: 1,
    opacity: 0.8,
    marginVertical: 10,
  },
  // --- BUSCADOR ---
  searchContainer: {
    marginBottom: 15,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  // --- ESTILOS DE TABLA (Alineados al borde del padding de mainSection) ---
  tableContainer: {
    marginTop: 10,
    marginBottom: 5,
    width: CARD_CONTENT_WIDTH, // La tabla toma el ancho exacto del contenido de la tarjeta
    alignSelf: 'center',
  },
  tableBodyScroll: {
    maxHeight: 500, 
  },
  // Encabezado de Semestre
  cicloHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Encabezado de la tabla
  header: {
    height: 40,
    overflow: 'hidden',
    marginBottom: 0, 
  },
  headerText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 11, 
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingVertical: 8,
  },
  row: {
    minHeight: 60, 
    borderBottomWidth: 1,
    justifyContent: 'center',
    flexDirection: 'row', 
  },
  materiaCell: {
    paddingLeft: 0, 
    paddingRight: 5,
    justifyContent: 'center',
    alignSelf: 'stretch', 
  },
  materiaNameText: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: 13,
    flexWrap: 'wrap', 
    paddingLeft: 5, 
  },
  calificacionBadge: {
    paddingHorizontal: 8, 
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 30, 
  },
  calificacionText: {
    fontSize: 13, 
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    width: CARD_CONTENT_WIDTH,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
});