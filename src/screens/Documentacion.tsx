import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import endeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { colors, platformTheme } from '../theme/platformTheme';
import { LoadingScreen } from '../screens/LoadingScreen';
import DocumentationCard from '../components/DocumentationCard';
import { IntDocumentationCard } from '../interfaces/appInterfaces';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

export const Documentacion = () => {
  const [loadingDoc, setLoadingDoc] = useState(false);
  const { data_alumno } = useContext( AuthContext );
  const [documentacion, setDocumentacion] = useState([]);
  useFocusEffect(
    useCallback(() => {
      getDocumentacion();
    }, [])
  );

  const getDocumentacion = async() => {
      setLoadingDoc(true);
      const {data} = await endeApi.get('/documento_alu_ram', { params: { 'id_alu_ram': data_alumno?.id_alu_ram } });
      if(data.data.length>0){
        setDocumentacion(data.data);
      }else{
        setDocumentacion([]);
      }
      setLoadingDoc(false);
  }

  const {height} = useWindowDimensions();

  return (
    <ScrollView>
      {
        loadingDoc ? 
          <View style={{marginVertical: 20}}>
            <LoadingScreen text='Cargando documentación...'/>
          </View>
        :
          (documentacion.length>0) ?
            documentacion.map(( data_doc:IntDocumentationCard )=>{
              return (
                <DocumentationCard key={data_doc.id_doc_alu_ram} data_doc={data_doc} onPressEvnt={true} />
              )
            })
          :
            <View style={{marginVertical: 20}}>
              <Text style={{textAlign: 'center', marginHorizontal: 20}}>Actualmente no posee documentación.</Text>
            </View>
      }
    </ScrollView>
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
});