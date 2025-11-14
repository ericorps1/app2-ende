import React, {useContext, useEffect, useState} from 'react'
import { Text, View, StyleSheet, Button, ScrollView, RefreshControl } from 'react-native';
import TarjetaPago from '../components/TarjetaPago';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { platformTheme, colors } from '../theme/platformTheme';
import { LoadingScreen } from './LoadingScreen';
import endeApi from '../api/estudianteAPI';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';
import { AddDomiciliation } from '../components/AddDomiciliation';

export const Pagos = () => {
  const { top } = useSafeAreaInsets();

  const [ refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const [noData, setNoData] = useState(false)
  const [domiciliation, setDomiciliation] = useState({
    isSaved: false,
    card_no: '',
    exp_month: '',
    exp_year: '',
    brand: ''
  })
  
  const onRefresh = () => {
    setRefreshing(false);
    obtener_pagos_alumno();
  }
  const { data_alumno } = useContext( AuthContext );
  const pagos = useAppSelector(state => state.datapagos);

  useEffect(() => {
    obtener_pagos_alumno();
    getDomiciliation();
  }, [])

  const obtener_pagos_alumno = async() => {
    try { 
      const {data} = await endeApi.get('/pagos', { params: { 'id_alu_ram': data_alumno!.id_alu_ram } });
      if(data.data.length>0){
        dispatch(updateInfoPagos(data.data));
      }else{
        setNoData(true);
        dispatch(updateInfoPagos([]));
      }
    } catch (error:any) {
      console.log(error);
    }
  };

  const getDomiciliation = async() => {
    try {
      const {data} = await endeApi.get('/domiciliacion/' + data_alumno?.id_alu_ram || '');
      if(data.data){
        setDomiciliation({
          isSaved: true,
          card_no: data.data.last_4,
          exp_month: data.data.exp_month,
          exp_year: data.data.exp_year,
          brand: data.data.brand
        });
      } else {
        setDomiciliation({
          isSaved: false,
          card_no: '',
          exp_month: '',
          exp_year: '',
          brand: ''
        });
      }
    } catch (error:any) {
      console.log(error);
    }
  };

  return (
    (pagos && pagos.length===0) ?
      <LoadingScreen/>
    :
      <View style={{ flex: 1 }}>
        <AddDomiciliation
          domiciliation={domiciliation}
          updateDomiciliation={getDomiciliation}
        />
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
              progressBackgroundColor={colors.primary}
              colors={ ['white'] }
            />
          }
        >
          {
            (noData===true)
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
      </View>
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