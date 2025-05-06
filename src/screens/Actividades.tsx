import React, {useEffect, useState, useContext} from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import cafeApi from '../api/estudianteAPI';
import { NoDataResult } from '../components/NoDataResult';
import { AuthContext } from '../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import { colors, platformTheme } from '../theme/platformTheme';
import { tiposActividades } from '../interfaces/appInterfaces';
import { Avatar, Card, IconButton } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { formatDate } from '../hooks/useFormats';

interface ObjListAct{
    tableHead: [string,string,string,string,string,string,string,string,string,string,string,string];
    tableInfo: [ListadoActividades]|[];
    widthArr: [number,number,number,number,number,number,number,number,number,number,number,number]
}

interface ListadoActividades {
    actividad: string;
    bloque: string;
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

export const Actividades = () => {
  const [loading, setLoading] = useState(true);
  const [dataActTable, setDataActTable] = useState<ObjListAct>({
    tableHead: ['#', 'Actividad', 'Materia', 'Bloque', 'Inicio', 'Fin', 'Tipo', 'Puntos', 'Puntos obtenidos', 'Retroalimentación','Estatus','Fecha de finalización'],
    tableInfo: [],
    widthArr: [30, 200, 100, 80, 80, 80, 100, 80, 150, 150, 80, 130]
  });
  const { data_alumno } = useContext( AuthContext );
  const [totales, setTotales] = useState({puntos: 0, puntosObtenidos: 0, aprovechamiento: 0})
  useEffect(() => {
    getActividades();
    return () => {}
  }, [])

  useEffect(() => {//se creo este useEffect debido a que si ejecutamos la funcion justo despues de la funcion de consulta no realiza los calculos, la informacion es vacia mientras se hace el renderizado de la tabla
    calcTotalesActividades();
  }, [dataActTable.tableInfo])
  
  
  const getActividades = async () => {
    setLoading(true);
    const {data} = await cafeApi.get(`actividades/historialActividades/${data_alumno?.id_alu_ram}`);
    if(data.trans){
      setDataActTable({...dataActTable, tableInfo: data.data});
    }
    setLoading(false);
  }

  const calcTotalesActividades = () => {
    if(dataActTable.tableInfo.length>0){
      let puntos = 0;
      let puntosObtenidos = 0;
      
      for(let i=0; i<dataActTable.tableInfo.length; i++){
        puntos = dataActTable.tableInfo[i].puntaje ? Number(puntos)+Number(dataActTable.tableInfo[i].puntaje) : puntos;
        puntosObtenidos = dataActTable.tableInfo[i].calificacion ? Number(puntosObtenidos)+Number(dataActTable.tableInfo[i].calificacion) : puntosObtenidos;
      }
      setTotales({
        puntos,
        puntosObtenidos,
        aprovechamiento: Number((puntosObtenidos/puntos)*100)
      });
    }
  }

  if(loading){
    return (
      <View style={styles.containerLoading}>
        <LoadingScreen text='Cargando historial de actividades...'/>
      </View>
    )
  }else{
    return (
      <>
        <View style={platformTheme.fila}>
          <View style={styles.containerCardInfo}>
            <Card.Title
              title=<Text style={styles.points}>{""+dataActTable.tableInfo.length}</Text>
              subtitle="Total actividades"
              left={(props) => <FontAwesome5 {...props} style={styles.iconCardStyle}  name="list-ol" />}
            />
          </View>
          <View style={styles.containerCardInfo}>
            <Card.Title
              title=<Text style={styles.points}>{""+totales.puntos}</Text>
              subtitle="Puntos"
              left={(props) => <FontAwesome5 {...props} style={styles.iconCardStyle}  name="check" />}
            />
          </View>
        </View>
        <View style={platformTheme.fila}>
          <View style={styles.containerCardInfo}>
            <Card.Title
              title=<Text style={styles.points}>{""+totales.puntosObtenidos}</Text>
              subtitle="Puntos obtenidos"
              left={(props) => <FontAwesome5 {...props} style={styles.iconCardStyle}  name="check-square" />}
            />
          </View>
          <View style={styles.containerCardInfo}>
            <Card.Title
              title=<Text style={styles.points}>{""+totales.aprovechamiento.toFixed(2)+"%"}</Text>
              subtitle="Aprovechamiento"
              left={(props) => <FontAwesome5 {...props} style={styles.iconCardStyle}  name="percent" />}
            />
          </View>
        </View>
        {
          dataActTable.tableInfo.length>0 ?
          <View style={styles.container}>
            <ScrollView horizontal={true}>
              <View>
                <Table borderStyle={{ borderWidth: 0.5, borderColor: colors.softSilver }}>
                  <Row 
                    data={dataActTable.tableHead} 
                    widthArr={dataActTable.widthArr}
                    style={styles.header}
                    textStyle={styles.textTableTitle}
                  />
                </Table>
                <ScrollView style={styles.dataWrapper}>
                  <Table borderStyle={{borderWidth: 1, borderColor: colors.softSilver}}>
                    {
                      dataActTable.tableInfo.map((actividad:ListadoActividades, index) => { 
                        const [fecha,hora] = actividad.fecha !== null ? actividad.fecha.split(' ') : ['',''];
                        let rowData = [
                          index+1,
                          actividad.actividad,
                          actividad.materia,
                          actividad.bloque,
                          formatDate(actividad.inicio,'/'),
                          formatDate(actividad.fin,'/'),
                          actividad.tipo==='Examen' ? 'Cuestionario' : actividad.tipo,
                          actividad.puntaje,
                          actividad.calificacion ? actividad.calificacion : 'Pendiente',
                          actividad.retroalimentacion ? actividad.retroalimentacion : 'Pendiente',
                          actividad.fecha ? 'Calificada' : 'Pendiente',
                          fecha!=='' ? formatDate(fecha,'/') : 'Pendiente'
                        ];
                        return (
                          <Row
                            key={index+1}
                            data={rowData}
                            widthArr={dataActTable.widthArr}
                            style={[
                              styles.row, 
                              { backgroundColor: index % 2 === 0 ? '#f7f9fc' : '#eef2f7' } // alternar color
                            ]}
                            textStyle={styles.textTableBody}
                          />
                        )
                      })
                    }
                  </Table>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
          :
            <NoDataResult msg='No posees historial de actividades.'/>
        }
      </>
    )
  }
}

const styles = StyleSheet.create({
  containerLoading: {
    paddingTop: 200,
  },
  containerCardInfo: {
    ...platformTheme.shadowBox,
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  iconCardStyle: {
    color: colors.blue,
  },
  points: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  container: {
    ...platformTheme.shadowBox,
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: {
    height: 50,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  textTableTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  textTableBody: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.silver, // Usar un color de letra más amigable
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dataWrapper: {
    marginTop: -1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  row: {
    height: 50,
    borderBottomColor: colors.softSilver,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
});
