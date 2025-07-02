import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, useWindowDimensions, TouchableOpacity } from 'react-native';
import cafeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { colors, platformTheme } from '../theme/platformTheme';
import { LoadingScreen } from '../screens/LoadingScreen';
import PaymentCard from './PaymentCard';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';
import { Pagos } from '../interfaces/appInterfaces';

export const PagosAnticipadosVencidos = () => {
    const [loadingPayExp, setLoadingPayExp] = useState(false);
    const { data_alumno } = useContext( AuthContext );
    const [viewContent, setViewContent] = useState(false)
    const paysExpired:Pagos[] = useAppSelector(state => state.datapagos);
    const dispatch = useAppDispatch();
    useEffect(() => {
        getPaysExpired();
        return () => {}
    }, [])
    
    const getPaysExpired = async() => {
        setLoadingPayExp(true);
        const {data} = await cafeApi.get('/pagos', { params: { 'id_alu_ram': data_alumno!.id_alu_ram } });
        if(data.data.length>0){
          dispatch(updateInfoPagos(data.data));
        }else{
          dispatch(updateInfoPagos([]));
        }
        setLoadingPayExp(false);
    }

    const {height} = useWindowDimensions();

    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={[
            styles.containerTitlePayExp,
            {
              borderBottomStartRadius: viewContent ? 0 : 10,
              borderBottomEndRadius: viewContent ? 0 : 10,
            }
          ]}
          activeOpacity={0.9}
          onPress={()=>setViewContent(!viewContent)}
        >
          <Text style={styles.textTitle}>Pagos anticipados y vencidos</Text>
        </TouchableOpacity>
        <View style={[styles.containerPayExp, {height: viewContent ? 'auto' : 0, opacity: viewContent ? 1 : 0}]}>
          {
            loadingPayExp ? 
              <View style={{marginVertical: 20}}>
                <LoadingScreen text='Cargando pagos anticipados / vencidos...'/>
              </View>
            :
              (paysExpired.length>0) ?
                paysExpired.map(( data_pagos:any )=>{
                  return (
                    <PaymentCard key={data_pagos.id_pag} data_pagos={data_pagos} />
                  )
                })
              :
                <View style={{marginVertical: 20}}>
                  <Text style={{textAlign: 'center', marginHorizontal: 20}}>Actualmente no posee pagos anticipados ni vencidos</Text>
                </View>
          }
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...platformTheme.shadowBox,
        padding: 10,
    },
    containerTitlePayExp: {
        overflow: 'hidden',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        height: 50,
    },
    textTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        color: 'white',
        backgroundColor: colors.primary,
    },
    containerPayExp: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.primary,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: 'white',
    }
});