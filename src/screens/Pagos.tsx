import React, {useContext, useEffect, useState} from 'react'
import { Text, View, StyleSheet, Button, ScrollView, RefreshControl } from 'react-native';
import TarjetaPago from '../components/TarjetaPago';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { platformTheme, colors } from '../theme/platformTheme';
import { LoadingScreen } from './LoadingScreen';
import endeApi from '../api/estudianteAPI';

export const Pagos = () => {
    
    const { top } = useSafeAreaInsets();

    const [ refreshing, setRefreshing] = useState(false);

    
    const onRefresh = () => {
        setPagos([]);
        setRefreshing(false);
        obtener_pagos_alumno();
    }
    type Pagos = [] | false;
    const { data_alumno } = useContext( AuthContext );
    const [pagos,setPagos] = useState<Pagos>([]);

    useEffect(() => {
        obtener_pagos_alumno();
    }, [])

    const obtener_pagos_alumno = async() => {
        try { 
            const {data} = await endeApi.get('/pagos', { params: { 'id_alu_ram': data_alumno!.id_alu_ram } });
            if(data.data.length>0){
                setPagos(data.data);
            }else{
                setPagos(false);
            }
        } catch (error:any) {
            console.log(error);
        }
    };

    return (
        (pagos && pagos.length===0) ?
            <LoadingScreen/>
        :
            <ScrollView
                style={{
                    marginTop: refreshing ? top : 0,
                    flex: 1
                }}
                refreshControl={
                    <RefreshControl 
                        refreshing={ refreshing }
                        onRefresh={ onRefresh }
                        progressViewOffset={ 10 }
                        progressBackgroundColor="#5856D6"
                        colors={ ['white','red','orange'] }
                        // style={{ backgroundColor: '#5856D6' }}
                        // tintColor="white"
                    />
                }
            >
                {
                    (pagos===false)
                        ? 
                            <Text style={styles.title}>No hay pagos registrados</Text>
                        : 
                            (pagos.length>0) &&
                                pagos.map(( data_pagos:any )=>{
                                    return (
                                        <TarjetaPago key={data_pagos.id_pag} data_pagos={data_pagos} />
                                    )
                                }) 
                }
            </ScrollView>
    )
}

const styles = StyleSheet.create({
    title: {
        color: colors.darkBlue,
        fontSize: 20,
        padding: 10,
        textAlign: 'center',
    }
});