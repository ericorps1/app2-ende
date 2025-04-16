import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { ActividadData, BloqueDataInfo, RecursoTeoricoData, tiposActividades } from '../interfaces/appInterfaces';
import { colors } from '../theme/platformTheme';
import { RecursoTeorico } from '../components/RecursoTeorico';
import cafeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { baseUrlFiles } from '../hooks/useGlobal';
import { AuthContext } from '../context/AuthContext';
import { Actividad } from '../components/Actividad';
import PaperMessages from '../components/PaperMessages';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';
import { Touchable } from '../components/Touchable';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/core';


interface BloqueDetalleProps {
    route: {
        params: {
            bloque_data: BloqueDataInfo;
            nom_mat?: string;
        }
    },
    navigation: any
}

export const BloqueDetalle = ({ route, navigation }:BloqueDetalleProps) => {
    const { data_alumno } = useContext( AuthContext );
    const {id_blo, nom_blo, des_blo, id_sub_hor} = route.params.bloque_data;
    const nom_mat = route.params.nom_mat;
    const [recursosTeoricos, setRecursosTeoricos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true)
    const [viewAlertVencida, setViewAlertVencida] = useState(false)
    const [conBlo, setConBlo] = useState('')
    
    useEffect( () => {
        // navigation.setOptions({
        //     title: nom_blo
        // })
        getDataView();
        return () => {
            setRecursosTeoricos([])
            setActividades([])
            setLoading(false)
            setViewAlertVencida(false)
        }
    },[])

    const getDataView = async () => {
        setLoading(true)
        await getRecursosTeoricos();
        await getActividades();
        await getConBlo();
        setLoading(false)
    }

    const getRecursosTeoricos = async () => {
        const {data} = await cafeApi.get('/recursos_teoricos/'+id_blo);
        setRecursosTeoricos(data.data);
    }

    const getActividades = async () => {
        const {data} = await cafeApi.get('/actividades/',{ params:{ id_sub_hor, id_blo, id_alu_ram: data_alumno?.id_alu_ram } });
        setActividades(data.data);
    }

    const getConBlo = async () => {
        const {data} = await cafeApi.get('/bloque/'+id_blo,{ params:{ cols: 'con_blo' } });
        if(data.trans){
            setConBlo(data.data.length>0 ? data.data[0].con_blo : '');
        }
    }

    const viewDetailRecTeorico = (htmlText:string,url_vid:string|null,title:string,arc_arc:string|null) => {
        if(url_vid!==null && url_vid!==''){//si tiene una url de video
            navigation.navigate('WebViewFullScreen', {htmlText: {html: htmlText}, title, url: url_vid.replace('watch?v=','embed/'), downloadFile:false, viewMiniChat: true});
        }else if (arc_arc!==null && arc_arc!==''){
            navigation.navigate('WebViewFullScreen', {htmlText: {html: htmlText}, title, url: baseUrlFiles+arc_arc, downloadFile:true, viewMiniChat: true});
        }else{
            navigation.navigate('WebViewFullScreen', {htmlText: {html: htmlText}, title, url: null, downloadFile:false, viewMiniChat: true});
        }
    }

    const viewDetailActividad = (actividad:ActividadData) => {
        const tipo = actividad.tipo
        switch (tipo) {
            case 'Foro' : navigation.navigate('Foro', { data_actividad: actividad });
                break;
            case 'Examen' : navigation.navigate('Examen', { data_actividad: actividad });
                break;
            case 'Entregable' : navigation.navigate('Entregable', { data_actividad: {...actividad, nom_blo, nom_mat} });
                break;
        }
    }

    if(loading) return (<LoadingScreen text={`Cargando ${nom_blo}`}/>)
    if(viewAlertVencida) return (
        <PaperMessages
            dismissable
            title='Actividad vencida :('
            visible={viewAlertVencida}
            message='No realizaste esta actividad en tiempo y forma, comunícate con tu profesor...'
            buttonText='Aceptar'
            onDismiss = {() => setViewAlertVencida(false)}
            pressButton = {() => setViewAlertVencida(false)}
        />
    )
    const onPressVideoConference = () => {
      navigation.navigate('JitsiMeetScreen', {id_sub_hor, title: 'Videoconferencia - '+nom_blo+' - '+des_blo})
    }

    return (
        <SafeAreaView style={ styles.container }>
            <BackButtonNavigation onPressBack={() => navigation.pop()} title={nom_blo+' - '+des_blo}/>
            <ScrollView  style={{marginBottom: 50}}>
              <View style={styles.containerVideoConference}>
                <Touchable 
                  onPress={onPressVideoConference}
                  styleContainer={{
                    ...styles.floatingIcon,
                    backgroundColor: colors.primary
                  }}
                >
                  <Icon name="videocam-outline" size={30} color="#fff" />
                </Touchable>
              </View>
              <View style={ styles.bodyBloDetalle }>
                  {
                      conBlo!=='' && 
                      <View>
                          <HtmlToJsx strHtml={conBlo}/>
                      </View>
                  }
                  <View style={styles.bodyBloDetalle}>
                      {
                          recursosTeoricos.length>0 ? 
                              recursosTeoricos.map((recurso:RecursoTeoricoData)=>{
                                  let icon = '';
                                  let iconColor = '';
                                  switch(recurso.tipo){
                                      case 'Video' : icon = 'youtube'; iconColor = 'red';
                                          break;
                                      case 'Wiki' : icon = 'wordpress'; iconColor = colors.green;
                                          break;
                                      case 'Archivo' : icon = 'file-word'; iconColor = colors.info;
                                          break;
                                      default : icon = 'youtube'; iconColor = 'red';
                                  }
                                  return <RecursoTeorico 
                                              key={recurso.identificador} 
                                              icon={icon} 
                                              iconColor={iconColor} 
                                              text={recurso.titulo} 
                                              onPress={() => viewDetailRecTeorico(recurso.descripcion,recurso.url_vid, recurso.titulo, recurso.arc_arc)}
                                          />
                              })
                          :
                              <Text style={styles.textNoRecTeo}>El bloque no contiene recursos teoricos.</Text>
                      }
                  </View>
              </View>
              <View style={styles.contActividades}>
                  <Text style={styles.titleActividades}>Actividades</Text>
                  {
                      actividades.length>0
                      ?
                          actividades.map((actividad:ActividadData)=>{
                              return <Actividad 
                                          key={actividad.identificador} 
                                          actividad={actividad} 
                                          onPress={
                                              // !actividad.fec_cal_act && actividad.estatus_fecha==='Vencida' ?
                                              //     () => setViewAlertVencida(true)
                                              // :
                                                  () => viewDetailActividad(actividad)
                                          }
                                      />
                          })
                      :
                          <Text style={styles.textNoRecTeo}>El bloque no contiene actividades.</Text>
                  }
              </View>
            </ScrollView>
            <ChatAlumno/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      marginTop: 10,
      flex: 1,
      marginLeft: 10,
    },
    containerVideoConference: {
      padding: 20,
      position: 'relative', 
    },
    floatingIcon: {
      position: 'absolute',
      top: -15,
      right: -15,
      borderRadius: 25,
      padding: 10,
      elevation: 10,  // Sombra en Android
      shadowColor: '#000',  // Sombra en iOS
      shadowOpacity: 0.3,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },
    bodyBloDetalle: { 
      flex: 1,
      justifyContent: 'flex-start',
      marginBottom: 20,
      marginLeft: 1,
    },
    title: {
      fontSize: 30,
      color: colors.darkBlue
    },
    subTitle: {
      color: colors.silver,
      fontSize: 15
    },
    textNoRecTeo: {
        color: colors.error,
        padding: 10,
        textAlign: 'center',
        fontWeight: '600'
    },
    contActividades: {
        marginBottom: 30,
        marginLeft: 1,
    },
    titleActividades: {
        color: colors.darkBlue,
        fontSize: 30,
        fontWeight: 'bold',
    }
});
