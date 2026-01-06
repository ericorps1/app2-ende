import React, {useEffect, useState, useContext} from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import cafeApi from '../api/estudianteAPI';
import { NoDataResult } from '../components/NoDataResult';
import { AuthContext } from '../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import { colors, platformTheme } from '../theme/platformTheme';
import { tiposActividades } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate } from '../hooks/useFormats';
import { useNavigation } from '@react-navigation/core';
import { useTheme } from '../context/ThemeContext';

interface ObjListAct{
    tableHead: [string,string,string,string,string,string,string,string,string,string,string];
    tableInfo: ListadoActividades[];
    widthArr: [number,number,number,number,number,number,number,number,number,number,number]
}

interface ListadoActividades {
    actividad: string;
    bloque: string;
    des_blo: string;
    id_sub_hor: number;
    calificacion: null|number;
    fecha: null|string;
    fin: string;
    fot_emp: string;
    id: number; 
    id_blo: number;
    id_cal_act: number;
    inicio: string; 
    materia: string;
    nom_pro: string;
    puntaje: number;
    retroalimentacion: string;
    tipo: tiposActividades;
}

type FilterType = 'pendientes' | 'vencidas' | 'realizadas' | 'calificadas';

export const Actividades = () => {
  const { colors: themeColors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [dataActTable, setDataActTable] = useState<ObjListAct>({
    tableHead: ['#', 'Estatus', 'Tipo', 'Actividad', 'Materia', 'Bloque', 'Inicio', 'Fin', 'Puntos', 'Obtenidos', 'Finalización'],
    tableInfo: [],
    widthArr: [50, 100, 100, 220, 120, 100, 90, 90, 70, 90, 110]
  });
  const { data_alumno } = useContext( AuthContext );
  const [totales, setTotales] = useState({
    puntos: 0, 
    puntosObtenidos: 0, 
    aprovechamiento: 0,
    pendientes: 0,
    vencidas: 0,
    realizadas: 0,
    calificadas: 0
  });

  // Detectar si es tema oscuro de manera más robusta
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 ACTIVIDADES - themeColors.background:', themeColors.background);
    console.log('🌓 ACTIVIDADES - themeColors.backgroundCard:', themeColors.backgroundCard);
    console.log('🌓 ACTIVIDADES - themeColors.textPrimary:', themeColors.textPrimary);
    
    // Chequear varios formatos de colores oscuros
    const isDark = bg === '#000' || 
                   bg === '#000000' ||
                   bg === '#121212' || 
                   bg === '#1a1a1a' ||
                   cardBg === '#000' ||
                   cardBg === '#000000' ||
                   cardBg === '#121212' ||
                   cardBg === '#1e1e1e' ||
                   cardBg === '#1a1a1a' ||
                   textPrimary === '#fff' ||
                   textPrimary === '#ffffff' ||
                   textPrimary === '#f5f5f5' ||
                   bg.includes('black') ||
                   (bg.startsWith('#') && parseInt(bg.replace('#', ''), 16) < 3355443); // Colores muy oscuros
    
    console.log('🌓 ACTIVIDADES - isDarkTheme resultado:', isDark);
    console.log('🌓 ACTIVIDADES - themeColors completo:', themeColors);
    
    return isDark;
  })();

  
  useEffect(() => {
    getActividades();
    return () => {}
  }, [])

  useEffect(() => {
    calcTotalesActividades();
  }, [dataActTable.tableInfo])
  
  const onRefresh = async () => {
    setRefreshing(true);
    await getActividades();
    setRefreshing(false);
  };
  
  const getActividades = async () => {
    setLoading(true);
    try {
      const {data} = await cafeApi.get(`actividades/historialActividades/${data_alumno?.id_alu_ram}`);
      if(data.trans && data.data){
        setDataActTable({...dataActTable, tableInfo: data.data});
      }
    } catch (error) {
      console.log('Error getActividades:', error);
    }
    setLoading(false);
  }

  const getEstatusActividad = (fec_cal_act: null|string, fin_actividad: string, calificacion: null|number): FilterType => {
    const fechaHoy = new Date();
    const fin = new Date(fin_actividad);

    if (fec_cal_act === null || fec_cal_act === '') {
      if (fechaHoy > fin) {
        return 'vencidas';
      } else {
        return 'pendientes';
      }
    } else {
      if (calificacion !== null) {
        return 'calificadas';
      } else {
        return 'realizadas';
      }
    }
  };

  const calcTotalesActividades = () => {
    if(dataActTable.tableInfo.length > 0){
      let puntos = 0;
      let puntosObtenidos = 0;
      let pendientes = 0;
      let vencidas = 0;
      let realizadas = 0;
      let calificadas = 0;
      
      for(let i = 0; i < dataActTable.tableInfo.length; i++){
        const act = dataActTable.tableInfo[i];
        
        puntos = act.puntaje ? Number(puntos) + Number(act.puntaje) : puntos;
        puntosObtenidos = act.calificacion ? Number(puntosObtenidos) + Number(act.calificacion) : puntosObtenidos;
        
        const estatus = getEstatusActividad(act.fecha, act.fin, act.calificacion);
        if (estatus === 'pendientes') pendientes++;
        else if (estatus === 'vencidas') vencidas++;
        else if (estatus === 'realizadas') realizadas++;
        else if (estatus === 'calificadas') calificadas++;
      }
      
      setTotales({
        puntos,
        puntosObtenidos,
        aprovechamiento: puntos > 0 ? Number((puntosObtenidos/puntos)*100) : 0,
        pendientes,
        vencidas,
        realizadas,
        calificadas
      });
    }
  }

  const navigation = useNavigation<any>();

  const handleActividadPress = (actividad:ListadoActividades) => {
    const nom_mat = actividad.materia;
    const bloque_data = {
      id_blo: actividad.id_blo,
      nom_blo: actividad.bloque,
      des_blo: actividad.des_blo,
      id_sub_hor: actividad.id_sub_hor
    };
    navigation.navigate('BloqueDetalle', {bloque_data, nom_mat})
  }

  const handleFilterPress = (type: FilterType) => {
    if (activeFilters.includes(type)) {
      setActiveFilters(activeFilters.filter(f => f !== type));
    } else {
      setActiveFilters([...activeFilters, type]);
    }
  };

  const removeFilter = (type: FilterType) => {
    setActiveFilters(activeFilters.filter(f => f !== type));
  };

  const getTipoBadgeStyle = (tipo: tiposActividades) => {
    const tipoNormalizado = tipo === 'Entregable' ? 'Tarea' : tipo === 'Examen' ? 'Cuestionario' : tipo;
    
    console.log('🎨 getTipoBadgeStyle - isDarkTheme:', isDarkTheme);
    console.log('🎨 getTipoBadgeStyle - tipo:', tipoNormalizado);
    
    if (isDarkTheme) {
      // Colores MUCHO más apagados y pastel para modo oscuro
      switch(tipoNormalizado) {
        case 'Tarea':
          console.log('✅ Usando color PASTEL para Tarea:', { bg: '#2A2F35', color: '#9DB4C8' });
          return { bg: '#2A2F35', color: '#9DB4C8', text: 'Tarea' };
        case 'Cuestionario':
          console.log('✅ Usando color PASTEL para Cuestionario:', { bg: '#352F2A', color: '#D4BDA0' });
          return { bg: '#352F2A', color: '#D4BDA0', text: 'Cuestionario' };
        case 'Foro':
          console.log('✅ Usando color PASTEL para Foro:', { bg: '#2F2A35', color: '#C4ADC8' });
          return { bg: '#2F2A35', color: '#C4ADC8', text: 'Foro' };
        default:
          console.log('✅ Usando color PASTEL default:', { bg: '#2B2B2B', color: '#B0B0B0' });
          return { bg: '#2B2B2B', color: '#B0B0B0', text: tipoNormalizado };
      }
    } else {
      console.log('⚪ Usando colores MODO CLARO');
      switch(tipoNormalizado) {
        case 'Tarea':
          return { bg: '#E3F2FD', color: '#1976D2', text: 'Tarea' };
        case 'Cuestionario':
          return { bg: '#FFF3E0', color: '#F57C00', text: 'Cuestionario' };
        case 'Foro':
          return { bg: '#F3E5F5', color: '#7B1FA2', text: 'Foro' };
        default:
          return { bg: '#F5F5F5', color: '#666', text: tipoNormalizado };
      }
    }
  };

  const getEstatusBadgeStyle = (estatus: FilterType) => {
    console.log('🏷️ getEstatusBadgeStyle - isDarkTheme:', isDarkTheme);
    console.log('🏷️ getEstatusBadgeStyle - estatus:', estatus);
    
    if (isDarkTheme) {
      // Colores MUCHO más suaves, casi grises con tinte pastel
      switch(estatus) {
        case 'pendientes':
          console.log('✅ Usando color PASTEL para Pendiente:', { bg: '#2B2B2B', color: '#A8A8A8' });
          return { bg: '#2B2B2B', color: '#A8A8A8', text: 'Pendiente' };
        case 'vencidas':
          console.log('✅ Usando color PASTEL para Vencida:', { bg: '#382E2D', color: '#D0A8A0' });
          return { bg: '#382E2D', color: '#D0A8A0', text: 'Vencida' };
        case 'realizadas':
          console.log('✅ Usando color PASTEL para Realizada:', { bg: '#2A2F35', color: '#9DB4C8' });
          return { bg: '#2A2F35', color: '#9DB4C8', text: 'Realizada' };
        case 'calificadas':
          console.log('✅ Usando color PASTEL para Calificada:', { bg: '#2D352E', color: '#A8C4A8' });
          return { bg: '#2D352E', color: '#A8C4A8', text: 'Calificada' };
      }
    } else {
      console.log('⚪ Usando colores MODO CLARO para estatus');
      switch(estatus) {
        case 'pendientes':
          return { bg: '#F5F5F5', color: '#666', text: 'Pendiente' };
        case 'vencidas':
          return { bg: '#FFE0E0', color: '#D32F2F', text: 'Vencida' };
        case 'realizadas':
          return { bg: '#E3F2FD', color: '#1976D2', text: 'Realizada' };
        case 'calificadas':
          return { bg: '#E8F5E9', color: '#34C759', text: 'Calificada' };
      }
    }
  };

  const getFilterBadgeStyle = (type: FilterType) => {
    if (isDarkTheme) {
      // Colores apagados para filtros en modo oscuro
      switch(type) {
        case 'pendientes':
          return { bg: '#484848', text: 'Pendientes' };
        case 'vencidas':
          return { bg: '#7A5E5B', text: 'Vencidas' };
        case 'realizadas':
          return { bg: '#4E5C6A', text: 'Realizadas' };
        case 'calificadas':
          return { bg: '#50685A', text: 'Calificadas' };
      }
    } else {
      switch(type) {
        case 'pendientes':
          return { bg: '#666', text: 'Pendientes' };
        case 'vencidas':
          return { bg: '#D32F2F', text: 'Vencidas' };
        case 'realizadas':
          return { bg: '#1976D2', text: 'Realizadas' };
        case 'calificadas':
          return { bg: '#34C759', text: 'Calificadas' };
      }
    }
  };

  const filteredActivities = dataActTable.tableInfo.filter((act: ListadoActividades) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        act.actividad.toLowerCase().includes(query) ||
        act.materia.toLowerCase().includes(query) ||
        act.bloque.toLowerCase().includes(query) ||
        act.tipo.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (activeFilters.length > 0) {
      const estatus = getEstatusActividad(act.fecha, act.fin, act.calificacion);
      return activeFilters.includes(estatus);
    }
    
    return true;
  });

  const getAprovechamientoColor = () => {
    if (isDarkTheme) {
      // Colores pastel MUY suaves para aprovechamiento
      if (totales.aprovechamiento >= 80) return '#A8C4A8';
      if (totales.aprovechamiento >= 60) return '#D4BDA0';
      return '#D0A8A0';
    } else {
      if (totales.aprovechamiento >= 80) return '#34C759';
      if (totales.aprovechamiento >= 60) return '#FF9500';
      return '#FF3B30';
    }
  };

  if(loading){
    return <LoadingScreen text='Cargando historial de actividades...'/>
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
      <View style={[
        styles.summaryContainer, 
        { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
        }
      ]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Total</Text>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
            {dataActTable.tableInfo.length}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Puntos totales</Text>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>{totales.puntos}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Obtenidos</Text>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
            {totales.puntosObtenidos}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Aprovechamiento</Text>
          <Text style={[styles.summaryValue, { color: getAprovechamientoColor() }]}>
            {totales.aprovechamiento.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.badgesContainer}>
        <TouchableOpacity 
          style={[
            styles.badge,
            { 
              backgroundColor: isDarkTheme ? '#2B2B2B' : themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
            },
            activeFilters.includes('pendientes') && { 
              backgroundColor: isDarkTheme ? '#484848' : '#666', 
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : '#808080' 
            }
          ]}
          onPress={() => handleFilterPress('pendientes')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            { color: isDarkTheme ? '#B0B0B0' : themeColors.textPrimary },
            activeFilters.includes('pendientes') && styles.badgeValueActive
          ]}>
            {totales.pendientes}
          </Text>
          <Text style={[
            styles.badgeLabel, 
            { color: isDarkTheme ? '#888888' : themeColors.textSecondary },
            activeFilters.includes('pendientes') && styles.badgeLabelActive
          ]}>
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.badge,
            { 
              backgroundColor: isDarkTheme ? '#382E2D' : '#FFEBEE',
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
            },
            activeFilters.includes('vencidas') && { 
              backgroundColor: isDarkTheme ? '#7A5E5B' : '#D32F2F', 
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : '#E57373' 
            }
          ]}
          onPress={() => handleFilterPress('vencidas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            { color: isDarkTheme ? '#D0A8A0' : '#D32F2F' },
            activeFilters.includes('vencidas') && styles.badgeValueActive
          ]}>
            {totales.vencidas}
          </Text>
          <Text style={[
            styles.badgeLabel, 
            { color: isDarkTheme ? '#D8BABA' : '#D32F2F' },
            activeFilters.includes('vencidas') && styles.badgeLabelActive
          ]}>
            Vencidas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.badge,
            { 
              backgroundColor: isDarkTheme ? '#2A2F35' : '#E3F2FD',
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
            },
            activeFilters.includes('realizadas') && { 
              backgroundColor: isDarkTheme ? '#4E5C6A' : '#1976D2', 
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : '#64B5F6' 
            }
          ]}
          onPress={() => handleFilterPress('realizadas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            { color: isDarkTheme ? '#9DB4C8' : '#1976D2' },
            activeFilters.includes('realizadas') && styles.badgeValueActive
          ]}>
            {totales.realizadas}
          </Text>
          <Text style={[
            styles.badgeLabel, 
            { color: isDarkTheme ? '#B0C4D8' : '#1976D2' },
            activeFilters.includes('realizadas') && styles.badgeLabelActive
          ]}>
            Realizadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.badge,
            { 
              backgroundColor: isDarkTheme ? '#2D352E' : '#E8F5E9',
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
            },
            activeFilters.includes('calificadas') && { 
              backgroundColor: isDarkTheme ? '#50685A' : '#34C759', 
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : '#69F0AE' 
            }
          ]}
          onPress={() => handleFilterPress('calificadas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            { color: isDarkTheme ? '#A8C4A8' : '#34C759' },
            activeFilters.includes('calificadas') && styles.badgeValueActive
          ]}>
            {totales.calificadas}
          </Text>
          <Text style={[
            styles.badgeLabel, 
            { color: isDarkTheme ? '#B8D4B8' : '#34C759' },
            activeFilters.includes('calificadas') && styles.badgeLabelActive
          ]}>
            Calificadas
          </Text>
        </TouchableOpacity>
      </View>

      {dataActTable.tableInfo.length > 0 ? (
        <View style={[
          styles.tableSection, 
          { 
            backgroundColor: themeColors.backgroundCard,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
          }
        ]}>
          <View style={styles.tableSectionHeader}>
            <View style={styles.titleRow}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                Historial de actividades
              </Text>
              {activeFilters.length > 0 && (
                <View style={styles.filterIndicatorsContainer}>
                  {activeFilters.map((filter) => {
                    const badgeStyle = getFilterBadgeStyle(filter);
                    return (
                      <View 
                        key={filter} 
                        style={[styles.filterIndicator, { backgroundColor: badgeStyle.bg }]}
                      >
                        <Text style={styles.filterIndicatorText}>{badgeStyle.text}</Text>
                        <TouchableOpacity onPress={() => removeFilter(filter)} activeOpacity={0.7}>
                          <Icon name="close-circle" size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            
            <View style={[
              styles.searchContainer, 
              { 
                backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
              }
            ]}>
              <Icon name="magnify" size={18} color={themeColors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: themeColors.textPrimary }]}
                placeholder="Buscar actividad, materia, bloque..."
                placeholderTextColor={themeColors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Icon name="close-circle" size={18} color={themeColors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
          >
            <View>
              <Table borderStyle={{ borderWidth: 0 }}>
                <Row 
                  data={dataActTable.tableHead} 
                  widthArr={dataActTable.widthArr}
                  style={{
                    ...styles.header,
                    backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.textPrimary
                  }}
                  textStyle={{
                    ...styles.textTableTitle,
                    color: isDarkTheme ? '#D0D0D0' : themeColors.backgroundCard
                  }}
                />
              </Table>
              <ScrollView 
                style={styles.dataWrapper}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                <Table borderStyle={{borderWidth: 0}}>
                  {filteredActivities.map((actividad:ListadoActividades, index) => { 
                    const [fecha, hora] = actividad.fecha !== null ? actividad.fecha.split(' ') : ['',''];
                    const estatus = getEstatusActividad(actividad.fecha, actividad.fin, actividad.calificacion);
                    const estatusBadge = getEstatusBadgeStyle(estatus);
                    const tipoBadge = getTipoBadgeStyle(actividad.tipo);
                    
                    console.log(`📋 Actividad ${index + 1}:`, actividad.actividad);
                    console.log(`   Estatus Badge:`, estatusBadge);
                    console.log(`   Tipo Badge:`, tipoBadge);
                    
                    let rowData = [
                      <Text style={[styles.indexNumber, { color: themeColors.textSecondary }]}>{index+1}</Text>,
                      <View style={[styles.estatusBadge, { backgroundColor: estatusBadge.bg }]}>
                        <Text style={[styles.estatusBadgeText, { color: estatusBadge.color }]}>
                          {estatusBadge.text}
                        </Text>
                      </View>,
                      <View style={[styles.tipoBadge, { backgroundColor: tipoBadge.bg }]}>
                        <Text style={[styles.tipoBadgeText, { color: tipoBadge.color }]}>
                          {tipoBadge.text}
                        </Text>
                      </View>,
                      <TouchableOpacity onPress={() => handleActividadPress(actividad)} activeOpacity={0.7}>
                        <Text style={[styles.actividadLink, { color: isDarkTheme ? '#9DB4C8' : '#1976D2' }]}>
                          {actividad.actividad}
                        </Text>
                      </TouchableOpacity>,
                      actividad.materia,
                      actividad.bloque,
                      formatDate(actividad.inicio,'/'),
                      formatDate(actividad.fin,'/'),
                      actividad.puntaje,
                      actividad.calificacion ? actividad.calificacion : <Text style={[styles.pendingText, { color: themeColors.textTertiary }]}>-</Text>,
                      fecha && fecha !== '' ? formatDate(fecha,'/') : <Text style={[styles.pendingText, { color: themeColors.textTertiary }]}>-</Text>
                    ];
                    return (
                      <Row
                        key={index+1}
                        data={rowData}
                        widthArr={dataActTable.widthArr}
                        style={{
                          ...styles.row,
                          backgroundColor: index % 2 === 0 
                            ? (isDarkTheme ? '#1E1E1E' : themeColors.backgroundGray)
                            : themeColors.backgroundCard,
                          borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : '#F0F0F0'
                        }}
                        textStyle={{
                          ...styles.textTableBody,
                          color: themeColors.textPrimary
                        }}
                      />
                    )
                  })}
                </Table>
              </ScrollView>
            </View>
          </ScrollView>

          {filteredActivities.length === 0 && (
            <View style={styles.noResults}>
              <Icon name="file-search-outline" size={48} color={isDarkTheme ? '#444' : themeColors.borderGray} />
              <Text style={[styles.noResultsText, { color: themeColors.textTertiary }]}>
                {searchQuery !== '' ? 'No se encontraron resultados' : 'No hay actividades con este filtro'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="clipboard-text-outline" size={64} color={isDarkTheme ? '#444' : themeColors.borderGray} />
          <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
            No hay actividades registradas
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 30,
  },
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  badge: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  badgeActive: {
    shadowOpacity: 0.2,
    elevation: 4,
  },
  badgeValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeValueActive: {
    color: '#FFF',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeLabelActive: {
    color: '#FFF',
  },
  tableSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  tableSectionHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterIndicatorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  filterIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  horizontalScroll: {
    maxHeight: 600,
  },
  header: {
    height: 48,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  textTableTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  textTableBody: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dataWrapper: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  row: {
    minHeight: 48,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  indexNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  estatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'center',
  },
  estatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tipoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'center',
  },
  tipoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actividadLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pendingText: {
    fontSize: 12,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
});