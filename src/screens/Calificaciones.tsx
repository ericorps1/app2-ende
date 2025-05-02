import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import cafeApi from '../api/estudianteAPI';
import { Table, Row } from 'react-native-table-component';
import { LoadingScreen } from './LoadingScreen';
import { colors, platformTheme } from '../theme/platformTheme';
import { Card, Title } from 'react-native-paper';
import { NoDataResult } from '../components/NoDataResult';
import { Dimensions } from 'react-native';

interface ListadoCalificaciones {
  nom_pro: string;
  app_pro: string;
  apm_pro: string;
  nom_mat: string;
}

interface ObjListCal {
  tableHead: [string, string, string, string];
  tableInfo: ListadoCalificaciones[];
  widthArr: [number, number, number, number];
}

const screenWidth = Dimensions.get('window').width - 20;
const [col1, col2, col3, col4] = [0.1, 0.4, 0.3, 0.2];
const columnWidths: [number, number, number, number] = [
  screenWidth * col1,
  screenWidth * col2,
  screenWidth * col3,
  screenWidth * col4,
];
export const Calificaciones = () => {
  const { data_alumno } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dataCalTable, setDataCalTable] = useState<ObjListCal>({
    tableHead: ['#', 'Profesor', 'Materia', 'Final'],
    tableInfo: [],
    widthArr: columnWidths,
  });

  useEffect(() => {
    getCalificaciones();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingScreen text="Cargando historial de calificaciones..." />
      </View>
    );
  }

  return (
    <>
      {dataCalTable.tableInfo.length > 0 ? (
        <Card style={styles.cardContainer}>
          <Card.Content>
            <Title style={styles.title}>Historial de Calificaciones</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <Table borderStyle={{ borderWidth: 1, borderColor: colors.softSilver }}>
                  <Row
                    data={dataCalTable.tableHead}
                    widthArr={dataCalTable.widthArr}
                    style={styles.header}
                    textStyle={styles.headerText}
                  />
                </Table>
                <ScrollView style={styles.dataWrapper}>
                  <Table borderStyle={{ borderWidth: 1, borderColor: colors.softSilver }}>
                    {dataCalTable.tableInfo.map((calificacion, index) => {
                      const rowData = [
                        index + 1,
                        `${calificacion.nom_pro} ${calificacion.app_pro} ${calificacion.apm_pro}`,
                        calificacion.nom_mat,
                        'Pendiente',
                      ];
                      return (
                        <Row
                          key={index}
                          data={rowData}
                          widthArr={dataCalTable.widthArr}
                          style={[
                            styles.row,
                            { backgroundColor: index % 2 === 0 ? '#f7f9fc' : '#eef2f7' },
                          ]}
                          textStyle={styles.bodyText}
                        />
                      );
                    })}
                  </Table>
                </ScrollView>
              </View>
            </ScrollView>
          </Card.Content>
        </Card>
      ) : (
        <NoDataResult msg="No posees historial de calificaciones." />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    ...platformTheme.shadowBox,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkBlue,
    textAlign: 'center',
  },
  header: {
    height: 50,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  dataWrapper: {
    marginTop: -1,
  },
  row: {
    backgroundColor: colors.softSilver,
  },
  bodyText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.silver, // Usar un color de letra más amigable
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
