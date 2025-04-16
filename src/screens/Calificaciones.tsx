import React, {useContext,useEffect, useState} from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import cafeApi from '../api/estudianteAPI';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import { LoadingScreen } from './LoadingScreen';
import { colors, platformTheme } from '../theme/platformTheme';
import { Card, Paragraph, Title } from 'react-native-paper';
import { formatDate } from '../hooks/useFormats';
import { NoDataResult } from '../components/NoDataResult';

interface ObjListCal{
    tableHead: [string,string,string,string];
    tableInfo: [ListadoCalificaciones]|[];
    widthArr: [number,number,number,number]
}

interface ListadoCalificaciones {
    nom_pro: string;
    app_pro: string;
    apm_pro: string;
    nom_mat: string;
}

export const Calificaciones = () => {
    const { data_alumno } = useContext( AuthContext );
    const [loading, setLoading] = useState(false);
    const [dataCalTable, setDataCalTable] = useState<ObjListCal>({
        tableHead: ['#', 'Profesor', 'Materia', 'Final'],
        tableInfo: [],
        widthArr: [30, 200, 100, 80]
      });
    useEffect(() => {
        getCalificaciones();
        return () => {}
    }, [])
    
    const getCalificaciones = async()=>{
        setLoading(true);
        const {data} = await cafeApi.get(`calificacion/calificacionesxmodalidad/${data_alumno?.id_alu}/${data_alumno?.id_alu_ram}`);
        if(data.trans){
            setDataCalTable({...dataCalTable, tableInfo: data.data});
        }
        setLoading(false);
    }
    if(loading){
        return (
            <View style={styles.containerLoading}>
                <LoadingScreen text='Cargando historial de calificaciones...'/>
            </View>
        )
    }else{
        return (
            <>
                {
                    dataCalTable.tableInfo.length>0 ?
                    <View style={styles.container}>
                        <ScrollView horizontal={true}>
                            <View>
                                <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9', borderRadius: 10}}>
                                    <Row 
                                        data={dataCalTable.tableHead} 
                                        widthArr={dataCalTable.widthArr}
                                        style={styles.header}
                                        textStyle={styles.textTableTitle}/>
                                </Table>
                                <ScrollView style={styles.dataWrapper}>
                                    <Table borderStyle={{borderWidth: 1, borderColor: colors.softSilver}}>
                                        {
                                            dataCalTable.tableInfo.map((calificacion:ListadoCalificaciones, index) => { 
                                                let rowData = [
                                                    index+1,
                                                    calificacion.nom_pro+" "+calificacion.app_pro+" "+calificacion.apm_pro,
                                                    calificacion.nom_mat,
                                                    'Pendiente'
                                                ];
                                                return (
                                                <Row
                                                    key={index+1}
                                                    data={rowData}
                                                    widthArr={dataCalTable.widthArr}
                                                    style={[styles.row, index%2 && {backgroundColor: colors.softBlue}]}
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
                        <NoDataResult msg='No posees historial de calificaciones.'/>

                }
            </>
        )
    }
}

const styles = StyleSheet.create({
    // container: {
    //     padding: 10
    // },
    containerLoading: {
        paddingTop: 200
    },
    containerCardInfo: {
        ...platformTheme.shadowBox,
        flex:1,
        margin: 5,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    iconCardStyle: {
        color: colors.darkBlue
    },
    container: {
        ...platformTheme.shadowBox,
        flex: 2,
        padding: 16,
        paddingTop: 30,
        backgroundColor: '#fff',
        margin: 5,
        borderRadius: 10,
    },
    header: {
        height: 50, 
        backgroundColor: colors.darkBlue 
    },
    textTableTitle: { 
        textAlign: 'center', 
        fontWeight: 'bold', 
        color: 'white' 
    },
    textTableBody: { 
        textAlign: 'center', 
        color: colors.darkBlue 
    },
    dataWrapper: { 
        marginTop: -1 
    },
    row: { 
        backgroundColor: colors.softSilver 
    }
});
