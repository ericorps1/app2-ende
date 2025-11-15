import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import { ActividadData, BloqueDataInfo, RecursoTeoricoData } from '../interfaces/appInterfaces';
import { RecursoTeorico } from '../components/RecursoTeorico';
import endeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { baseUrlFiles } from '../hooks/useGlobal';
import { AuthContext } from '../context/AuthContext';
import { Actividad } from '../components/Actividad';
import PaperMessages from '../components/PaperMessages';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/platformTheme';

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
  const {id_blo, nom_blo, des_blo, id_sub_hor, img_blo} = route.params.bloque_data;
  const nom_mat = route.params.nom_mat;
  const [recursosTeoricos, setRecursosTeoricos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewAlertVencida, setViewAlertVencida] = useState(false);
  const [conBlo, setConBlo] = useState('');
  const [actividadesConCalificacion, setActividadesConCalificacion] = useState<{[key: number]: any}>({});
  
  useEffect( () => {
    getDataView();
    return () => {
      setRecursosTeoricos([])
      setActividades([])
      setLoading(false)
      setViewAlertVencida(false)
    }
  },[])

  const onRefresh = async () => {
    setRefreshing(true);
    await getDataView();
    setRefreshing(false);
  };

  const getDataView = async () => {
    setLoading(true)
    await Promise.all([
      getRecursosTeoricos(),
      getActividades(),
      getConBlo()
    ]);
    setLoading(false)
  }

  const getRecursosTeoricos = async () => {
    const {data} = await endeApi.get('/recursos_teoricos/'+id_blo);
    setRecursosTeoricos(data.data);
  }

  const getActividades = async () => {
    const {data} = await endeApi.get('/actividades/',{ params:{ id_sub_hor, id_blo, id_alu_ram: data_alumno?.id_alu_ram } });
    setActividades(data.data);
    
    // Obtener calificaciones de todas las actividades
    const calificaciones: {[key: number]: any} = {};
    for (const actividad of data.data) {
      const calData = await endeApi.get('cal_act/' + actividad.id_cal_act);
      if (calData.data.trans && calData.data.data.length > 0) {
        calificaciones[actividad.id_cal_act] = calData.data.data[0];
      }
    }
    setActividadesConCalificacion(calificaciones);
  }

  const getConBlo = async () => {
    const {data} = await endeApi.get('/bloque/'+id_blo,{ params:{ cols: 'con_blo' } });
    if(data.trans){
      setConBlo(data.data.length>0 ? data.data[0].con_blo : '');
    }
  }

  const viewDetailRecTeorico = (htmlText:string,url_vid:string|null,title:string,arc_arc:string|null) => {
    if(url_vid!==null && url_vid!==''){
      navigation.navigate('WebViewFullScreen', {htmlText: {html: htmlText}, title, url: url_vid.replace('watch?v=','embed/'), downloadFile:false, viewMiniChat: true});
    }else if (arc_arc!==null && arc_arc!==''){
      navigation.navigate('WebViewFullScreen', {htmlText: {html: htmlText}, title, url: baseUrlFiles+arc_arc, downloadFile:true, viewMiniChat: true});
    }else{
      navigation.navigate('WebViewFullScreen', {htmlText: {html: htmlText}, title, url: null, downloadFile:false, viewMiniChat: true});
    }
  }

  const viewDetailActividad = (actividad:ActividadData) => {
    // Verificar si el alumno ya hizo la actividad
    const calificacion = actividadesConCalificacion[actividad.id_cal_act];
    const yaHizoActividad = calificacion && (calificacion.fec_cal_act || calificacion.int_cal_act > 0);
    
    // Si ya hizo la actividad, puede acceder siempre (aunque esté vencida)
    if (yaHizoActividad) {
      navegarAActividad(actividad);
      return;
    }
    
    // Si NO hizo la actividad y está vencida, mostrar alerta
    if (actividad.estatus_fecha === 'Vencida') {
      setViewAlertVencida(true);
      return;
    }
    
    // Si está vigente, puede acceder
    navegarAActividad(actividad);
  }

  const navegarAActividad = (actividad: ActividadData) => {
    const tipo = actividad.tipo;
    switch (tipo) {
      case 'Foro': 
        navigation.navigate('Foro', { data_actividad: actividad });
        break;
      case 'Examen': 
        navigation.navigate('Examen', { data_actividad: actividad });
        break;
      case 'Entregable': 
        navigation.navigate('Entregable', { data_actividad: {...actividad, nom_blo, nom_mat} });
        break;
    }
  }

  const onPressVideoConference = () => {
    navigation.navigate('JitsiMeetScreen', {id_sub_hor, title: 'Videoconferencia - '+nom_blo+' - '+des_blo, nom_mat})
  }

  const getFileIconAndColor = (fileName: string | null) => {
    if (!fileName) return { icon: 'file-document-outline', color: '#666' };
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Si no hay extensión, retornar default
    if (!extension || extension === fileName) {
      return { icon: 'file-document-outline', color: '#666' };
    }
    
    switch(extension) {
      case 'pdf':
        return { icon: 'file-pdf-box', color: '#D32F2F' };
      case 'doc':
      case 'docx':
        return { icon: 'file-word-box', color: '#2B579A' };
      case 'xls':
      case 'xlsx':
        return { icon: 'file-excel-box', color: '#217346' };
      case 'ppt':
      case 'pptx':
        return { icon: 'file-powerpoint-box', color: '#D24726' };
      case 'zip':
      case 'rar':
      case '7z':
        return { icon: 'folder-zip', color: '#FFA000' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return { icon: 'file-image', color: '#7C4DFF' };
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
        return { icon: 'file-video', color: '#E91E63' };
      case 'mp3':
      case 'wav':
      case 'flac':
        return { icon: 'file-music', color: '#00BCD4' };
      case 'txt':
        return { icon: 'file-document', color: '#607D8B' };
      default:
        return { icon: 'file-document-outline', color: '#666' };
    }
  }

  if(loading) return (<LoadingScreen text={`Cargando ${nom_blo}`}/>)
  
  if(viewAlertVencida) return (
    <PaperMessages
      dismissable
      title='Actividad no disponible'
      visible={viewAlertVencida}
      message='Esta actividad se encuentra vencida y no la has realizado. No puedes acceder a ella.'
      buttonText='Aceptar'
      onDismiss = {() => setViewAlertVencida(false)}
      pressButton = {() => setViewAlertVencida(false)}
      colorTitle={colors.error}
    />
  )

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
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
        {/* HERO IMAGE - ESTILO NOTION */}
        <ImageBackground
          source={{ uri: 'https://plataforma.ahjende.com/fondos_clase/' + img_blo }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <View style={styles.heroOverlay} />
          
          {/* BOTÓN BACK FLOTANTE */}
          <TouchableOpacity 
            onPress={() => navigation.pop()} 
            style={styles.backButton}
            activeOpacity={0.9}
          >
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>

          {/* TÍTULO SOBRE LA IMAGEN */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle} numberOfLines={2}>{nom_blo}</Text>
            {des_blo && <Text style={styles.heroSubtitle} numberOfLines={2}>{des_blo}</Text>}
          </View>
        </ImageBackground>

        {/* CONTENIDO */}
        <View style={styles.contentWrapper}>
          {/* BOTÓN VIDEOCONFERENCIA */}
          <TouchableOpacity 
            style={styles.videoButton}
            onPress={onPressVideoConference}
            activeOpacity={0.9}
          >
            <View style={styles.videoIconContainer}>
              <Icon name="video" size={18} color="#FFF" />
            </View>
            <Text style={styles.videoButtonText}>Unirse a videoconferencia</Text>
            <Icon name="chevron-right" size={18} color="#FFF" />
          </TouchableOpacity>

          {/* CONTENIDO DEL BLOQUE */}
          {conBlo !== '' && (
            <View style={styles.contentSection}>
              <HtmlToJsx strHtml={conBlo}/>
            </View>
          )}

          {/* SECCIÓN RECURSOS TEÓRICOS */}
          <View style={styles.sectionHeader}>
            <Icon name="book-open-variant" size={18} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Recursos teóricos</Text>
          </View>
          
          {recursosTeoricos.length > 0 ? (
            recursosTeoricos.map((recurso:RecursoTeoricoData) => {
              let icon = '';
              let iconColor = '';
              
              switch(recurso.tipo){
                case 'Video':
                  icon = 'youtube';
                  iconColor = '#FF0000';
                  break;
                case 'Wiki':
                  icon = 'book-open';
                  iconColor = '#000000';
                  break;
                case 'Archivo':
                  const fileInfo = getFileIconAndColor(recurso.arc_arc);
                  icon = fileInfo.icon;
                  iconColor = fileInfo.color;
                  break;
                default:
                  icon = 'file';
                  iconColor = '#999';
              }
              
              return (
                <RecursoTeorico 
                  key={recurso.identificador} 
                  icon={icon} 
                  iconColor={iconColor} 
                  text={recurso.titulo} 
                  onPress={() => viewDetailRecTeorico(recurso.descripcion,recurso.url_vid, recurso.titulo, recurso.arc_arc)}
                />
              )
            })
          ) : (
            <View style={styles.emptyState}>
              <Icon name="book-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyStateText}>No hay recursos teóricos</Text>
            </View>
          )}

          {/* SECCIÓN ACTIVIDADES */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Icon name="clipboard-text" size={18} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Actividades</Text>
          </View>
          
          {actividades.length > 0 ? (
            actividades.map((actividad:ActividadData) => (
              <Actividad 
                key={actividad.identificador} 
                actividad={actividad} 
                onPress={() => viewDetailActividad(actividad)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="clipboard-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyStateText}>No hay actividades</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ChatAlumno/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentWrapper: {
    paddingHorizontal: 16,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  videoButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  contentSection: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});