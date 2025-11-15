import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import cafeApi from '../api/estudianteAPI';
import { Table, Row } from 'react-native-table-component';
import { LoadingScreen } from './LoadingScreen';
import { colors, platformTheme } from '../theme/platformTheme';
import { NoDataResult } from '../components/NoDataResult';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ListadoCalificaciones {
  nom_pro: string;
  app_pro: string;
  apm_pro: string;
  nom_mat: string;
  calificacion_final?: number | null;
}

interface ObjListCal {
  tableHead: [string, string, string, string];
  tableInfo: ListadoCalificaciones[];
  widthArr: [number, number, number, number];
}

export const Calificaciones = () => {
  const { data_alumno } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataCalTable, setDataCalTable] = useState<ObjListCal>({
    tableHead: ['#', 'Profesor', 'Materia', 'Final'],
    tableInfo: [],
    widthArr: [50, 200, 180, 80],
  });

  useEffect(() => {
    getCalificaciones();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCalificaciones();
    setRefreshing(false);
  };

  const getCalificaciones = async () => {
    setLoading(true);
    try {
      const { data } = await cafeApi.get(`calificacion/calificacionesxmodalidad/${data_alumno?.id_alu}/${data_alumno?.id_alu_ram}`);
      if (data.trans) {
        setDataCalTable(prev => ({ ...prev, tableInfo: data.data }));
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    }
    setLoading(false);
  };

  const calcularPromedio = () => {
    if (dataCalTable.tableInfo.length === 0) return 0;
    
    const calificacionesValidas = dataCalTable.tableInfo.filter(
      cal => cal.calificacion_final !== null && cal.calificacion_final !== undefined
    );
    
    if (calificacionesValidas.length === 0) return 0;
    
    const suma = calificacionesValidas.reduce(
      (acc, cal) => acc + (cal.calificacion_final || 0), 
      0
    );
    
    return suma / calificacionesValidas.length;
  };

  const getPromedioColor = (promedio: number) => {
    if (promedio >= 9) return '#34C759';
    if (promedio >= 8) return '#FF9500';
    if (promedio >= 7) return '#FF9500';
    return '#FF3B30';
  };

  const promedio = calcularPromedio();

  if (loading) {
    return <LoadingScreen text="Cargando historial de calificaciones..." />;
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
      {/* DASHBOARD */}
      <View style={styles.dashboardContainer}>
        <View style={styles.dashboardCard}>
          <Icon name="book-open-variant" size={24} color="#666" style={styles.dashboardIcon} />
          <Text style={styles.dashboardValue}>{dataCalTable.tableInfo.length}</Text>
          <Text style={styles.dashboardLabel}>Materias</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Icon name="chart-line" size={24} color={promedio > 0 ? getPromedioColor(promedio) : '#999'} style={styles.dashboardIcon} />
          <Text style={[styles.dashboardValue, { color: promedio > 0 ? getPromedioColor(promedio) : '#999' }]}>
            {promedio > 0 ? promedio.toFixed(2) : 'N/A'}
          </Text>
          <Text style={styles.dashboardLabel}>Promedio General</Text>
        </View>
      </View>

      {/* TABLE */}
      {dataCalTable.tableInfo.length > 0 ? (
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Historial de Calificaciones</Text>
          
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
          >
            <View>
              <Table borderStyle={{ borderWidth: 0 }}>
                <Row
                  data={dataCalTable.tableHead}
                  widthArr={dataCalTable.widthArr}
                  style={styles.header}
                  textStyle={styles.headerText}
                />
              </Table>
              <ScrollView 
                style={styles.dataWrapper}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                <Table borderStyle={{ borderWidth: 0 }}>
                  {dataCalTable.tableInfo.map((calificacion, index) => {
                    const rowData = [
                      <Text style={styles.indexNumber}>{index + 1}</Text>,
                      `${calificacion.nom_pro} ${calificacion.app_pro} ${calificacion.apm_pro}`,
                      calificacion.nom_mat,
                      calificacion.calificacion_final !== null && calificacion.calificacion_final !== undefined ? (
                        <View style={[
                          styles.calificacionBadge,
                          { backgroundColor: calificacion.calificacion_final >= 7 ? '#E8F5E9' : '#FFEBEE' }
                        ]}>
                          <Text style={[
                            styles.calificacionText,
                            { color: calificacion.calificacion_final >= 7 ? '#34C759' : '#E53935' }
                          ]}>
                            {calificacion.calificacion_final.toFixed(1)}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>Pendiente</Text>
                        </View>
                      ),
                    ];
                    return (
                      <Row
                        key={index}
                        data={rowData}
                        widthArr={dataCalTable.widthArr}
                        style={[
                          styles.row,
                          { backgroundColor: index % 2 === 0 ? '#FAFAFA' : '#FFF' },
                        ]}
                        textStyle={styles.bodyText}
                      />
                    );
                  })}
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="clipboard-text-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No hay calificaciones registradas</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dashboardIcon: {
    marginBottom: 8,
  },
  dashboardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  dashboardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  headerText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 11,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingVertical: 8,
    paddingHorizontal: 6,
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
  bodyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  indexNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  calificacionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  calificacionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  pendingBadgeText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
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