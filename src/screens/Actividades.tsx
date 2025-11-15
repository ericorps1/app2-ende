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
        
        // Puntos
        puntos = act.puntaje ? Number(puntos) + Number(act.puntaje) : puntos;
        puntosObtenidos = act.calificacion ? Number(puntosObtenidos) + Number(act.calificacion) : puntosObtenidos;
        
        // Estatus
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
  };

  const getEstatusBadgeStyle = (estatus: FilterType) => {
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
  };

  const getFilterBadgeStyle = (type: FilterType) => {
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
  };

  const filteredActivities = dataActTable.tableInfo.filter((act: ListadoActividades) => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        act.actividad.toLowerCase().includes(query) ||
        act.materia.toLowerCase().includes(query) ||
        act.bloque.toLowerCase().includes(query) ||
        act.tipo.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filtro por estatus múltiple
    if (activeFilters.length > 0) {
      const estatus = getEstatusActividad(act.fecha, act.fin, act.calificacion);
      return activeFilters.includes(estatus);
    }
    
    return true;
  });

  const getAprovechamientoColor = () => {
    if (totales.aprovechamiento >= 80) return '#34C759';
    if (totales.aprovechamiento >= 60) return '#FF9500';
    return '#FF3B30';
  };

  if(loading){
    return <LoadingScreen text='Cargando historial de actividades...'/>
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#000"
          colors={['#000']}
        />
      }
    >
      {/* SUMATORIAS CON TOTAL */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{dataActTable.tableInfo.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Puntos totales</Text>
          <Text style={styles.summaryValue}>{totales.puntos}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Obtenidos</Text>
          <Text style={styles.summaryValue}>{totales.puntosObtenidos}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Aprovechamiento</Text>
          <Text style={[styles.summaryValue, { color: getAprovechamientoColor() }]}>
            {totales.aprovechamiento.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* BADGES DE ESTATUS - FILTROS MÚLTIPLES */}
      <View style={styles.badgesContainer}>
        <TouchableOpacity 
          style={[
            styles.badge,
            activeFilters.includes('pendientes') && styles.badgeActivePending
          ]}
          onPress={() => handleFilterPress('pendientes')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            activeFilters.includes('pendientes') && styles.badgeValueActive
          ]}>
            {totales.pendientes}
          </Text>
          <Text style={[styles.badgeLabel, activeFilters.includes('pendientes') && styles.badgeLabelActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.badge,
            styles.badgeDanger,
            activeFilters.includes('vencidas') && styles.badgeActiveRed
          ]}
          onPress={() => handleFilterPress('vencidas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            styles.dangerText,
            activeFilters.includes('vencidas') && styles.badgeValueActive
          ]}>
            {totales.vencidas}
          </Text>
          <Text style={[styles.badgeLabel, activeFilters.includes('vencidas') && styles.badgeLabelActive]}>
            Vencidas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.badge,
            styles.badgeInfo,
            activeFilters.includes('realizadas') && styles.badgeActiveBlue
          ]}
          onPress={() => handleFilterPress('realizadas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            styles.infoText,
            activeFilters.includes('realizadas') && styles.badgeValueActive
          ]}>
            {totales.realizadas}
          </Text>
          <Text style={[styles.badgeLabel, activeFilters.includes('realizadas') && styles.badgeLabelActive]}>
            Realizadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.badge,
            styles.badgeSuccess,
            activeFilters.includes('calificadas') && styles.badgeActiveGreen
          ]}
          onPress={() => handleFilterPress('calificadas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.badgeValue,
            styles.successText,
            activeFilters.includes('calificadas') && styles.badgeValueActive
          ]}>
            {totales.calificadas}
          </Text>
          <Text style={[styles.badgeLabel, activeFilters.includes('calificadas') && styles.badgeLabelActive]}>
            Calificadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* TABLE */}
      {dataActTable.tableInfo.length > 0 ? (
        <View style={styles.tableSection}>
          <View style={styles.tableSectionHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle}>Historial de actividades</Text>
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
            
            {/* SEARCH BAR */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={18} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar actividad, materia, bloque..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Icon name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* SCROLL HORIZONTAL + VERTICAL */}
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
                  style={styles.header}
                  textStyle={styles.textTableTitle}
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
                    
                    let rowData = [
                      <Text style={styles.indexNumber}>{index+1}</Text>,
                      // ESTATUS
                      <View style={[styles.estatusBadge, { backgroundColor: estatusBadge.bg }]}>
                        <Text style={[styles.estatusBadgeText, { color: estatusBadge.color }]}>
                          {estatusBadge.text}
                        </Text>
                      </View>,
                      // TIPO
                      <View style={[styles.tipoBadge, { backgroundColor: tipoBadge.bg }]}>
                        <Text style={[styles.tipoBadgeText, { color: tipoBadge.color }]}>
                          {tipoBadge.text}
                        </Text>
                      </View>,
                      // ACTIVIDAD
                      <TouchableOpacity onPress={() => handleActividadPress(actividad)} activeOpacity={0.7}>
                        <Text style={styles.actividadLink}>{actividad.actividad}</Text>
                      </TouchableOpacity>,
                      actividad.materia,
                      actividad.bloque,
                      formatDate(actividad.inicio,'/'),
                      formatDate(actividad.fin,'/'),
                      actividad.puntaje,
                      actividad.calificacion ? actividad.calificacion : <Text style={styles.pendingText}>-</Text>,
                      fecha && fecha !== '' ? formatDate(fecha,'/') : <Text style={styles.pendingText}>-</Text>
                    ];
                    return (
                      <Row
                        key={index+1}
                        data={rowData}
                        widthArr={dataActTable.widthArr}
                        style={[
                          styles.row, 
                          { backgroundColor: index % 2 === 0 ? '#FAFAFA' : '#FFF' }
                        ]}
                        textStyle={styles.textTableBody}
                      />
                    )
                  })}
                </Table>
              </ScrollView>
            </View>
          </ScrollView>

          {filteredActivities.length === 0 && (
            <View style={styles.noResults}>
              <Icon name="file-search-outline" size={48} color="#E0E0E0" />
              <Text style={styles.noResultsText}>
                {searchQuery !== '' ? 'No se encontraron resultados' : 'No hay actividades con este filtro'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="clipboard-text-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No hay actividades registradas</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  badge: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  badgeDanger: {
    backgroundColor: '#FFEBEE',
  },
  badgeInfo: {
    backgroundColor: '#E3F2FD',
  },
  badgeActivePending: {
    backgroundColor: '#666',
  },
  badgeActiveRed: {
    backgroundColor: '#D32F2F',
  },
  badgeActiveBlue: {
    backgroundColor: '#1976D2',
  },
  badgeActiveGreen: {
    backgroundColor: '#34C759',
  },
  badgeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  successText: {
    color: '#34C759',
  },
  dangerText: {
    color: '#D32F2F',
  },
  infoText: {
    color: '#1976D2',
  },
  badgeValueActive: {
    color: '#FFF',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  badgeLabelActive: {
    color: '#FFF',
  },
  tableSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#000',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 0,
  },
  horizontalScroll: {
    maxHeight: 600,
  },
  header: {
    height: 48,
    backgroundColor: '#000',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  textTableTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 11,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  textTableBody: {
    textAlign: 'center',
    fontSize: 13,
    color: '#000',
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
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  indexNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
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
    color: '#000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pendingText: {
    color: '#999',
    fontSize: 12,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});