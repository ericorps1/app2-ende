import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ImageBackground, useWindowDimensions, useColorScheme, Platform, LayoutAnimation, UIManager, SafeAreaView } from 'react-native';
import { ActividadData, BloqueDataInfo, RecursoTeoricoData } from '../interfaces/appInterfaces';
import { RecursoTeorico } from '../components/RecursoTeorico';
import endeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { baseUrlFiles } from '../hooks/useGlobal';
import { AuthContext } from '../context/AuthContext';
import { Actividad } from '../components/Actividad';
import PaperMessages from '../components/PaperMessages';
import { ChatAlumno } from '../components/ChatAlumno';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/platformTheme';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const { theme, colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { data_alumno } = useContext( AuthContext );
  const { width } = useWindowDimensions();
  
  const {id_blo, nom_blo, des_blo, id_sub_hor, img_blo} = route.params.bloque_data;
  const nom_mat = route.params.nom_mat;
  
  const [recursosTeoricos, setRecursosTeoricos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewAlertVencida, setViewAlertVencida] = useState(false);
  const [conBlo, setConBlo] = useState('');
  const [actividadesConCalificacion, setActividadesConCalificacion] = useState<{[key: number]: any}>({});
  const [imagenBloque, setImagenBloque] = useState(img_blo || 'default.jpg');
  const [webViewHeight, setWebViewHeight] = useState(400);
  const [accordionOpen, setAccordionOpen] = useState(true);
  
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    const isDark = bg === '#000' || 
                   bg === '#000000' ||
                   bg === '#121212' || 
                   bg === '#1a1a1a' ||
                   cardBg === '#000' ||
                   cardBg === '#000000' ||
                   cardBg === '#121212' ||
                   cardBg === '#1e1e1e' ||
                   cardBg === '#1a1a1a' ||
                   textPrimary === '#fff' ||
                   textPrimary === '#ffffff' ||
                   textPrimary === '#f5f5f5' ||
                   bg.includes('black') ||
                   (bg.startsWith('#') && parseInt(bg.replace('#', ''), 16) < 3355443);
    
    return isDark;
  })();
  
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
    try {
      const {data} = await endeApi.get('/bloque/'+id_blo, { 
        params: { cols: 'con_blo,img_blo' }
      });
      
      if(data.trans && data.data.length > 0){
        const bloqueCompleto = data.data[0];
        setConBlo(bloqueCompleto.con_blo || '');
        
        if (bloqueCompleto.img_blo) {
          setImagenBloque(bloqueCompleto.img_blo);
        }
      }
    } catch (error) {
      console.log('❌ Error obteniendo contenido del bloque:', error);
    }
  }

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordionOpen(!accordionOpen);
  };

  const viewDetailRecTeorico = (htmlText:string,url_vid:string|null,title:string,arc_arc:string|null) => {
    if(url_vid!==null && url_vid!==''){
      let videoId = null;
      let isYouTube = false;
      
      if (url_vid.includes('youtube.com') || url_vid.includes('youtu.be')) {
        isYouTube = true;
        
        if (url_vid.includes('youtube.com/watch')) {
          videoId = url_vid.split('watch?v=')[1]?.split('&')[0];
        } else if (url_vid.includes('youtu.be/')) {
          videoId = url_vid.split('youtu.be/')[1]?.split('?')[0];
        } else if (url_vid.includes('youtube.com/embed/')) {
          videoId = url_vid.split('embed/')[1]?.split('?')[0];
        }
      }
      
      navigation.navigate('WebViewFullScreen', {
        htmlText: {html: htmlText}, 
        title, 
        url: url_vid,
        isYouTube,
        videoId,
        downloadFile: false, 
        viewMiniChat: true
      });
    }else if (arc_arc!==null && arc_arc!==''){
      navigation.navigate('WebViewFullScreen', {
        htmlText: {html: htmlText}, 
        title, 
        url: baseUrlFiles+arc_arc, 
        downloadFile: true, 
        viewMiniChat: true,
        isYouTube: false
      });
    }else{
      navigation.navigate('WebViewFullScreen', {
        htmlText: {html: htmlText}, 
        title, 
        url: null, 
        downloadFile: false, 
        viewMiniChat: true,
        isYouTube: false
      });
    }
  }

  const viewDetailActividad = (actividad:ActividadData) => {
    const calificacion = actividadesConCalificacion[actividad.id_cal_act];
    
    if (!calificacion) return;

    const fec_cal_act = calificacion.fec_cal_act;
    const fin_cal_act = calificacion.fin_cal_act;
    const pun_cal_act = calificacion.pun_cal_act;

    if (fec_cal_act === null) {
      const fechaHoy = new Date();
      
      const [year, month, day] = fin_cal_act.split('-').map(Number);
      const fechaFin = new Date(year, month - 1, day);
      fechaFin.setHours(23, 59, 59, 999);

      if (fechaHoy > fechaFin) {
        setViewAlertVencida(true);
        return;
      } else {
        navegarAActividad(actividad);
        return;
      }
    } else {
      navegarAActividad(actividad);
      return;
    }
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
    if (!fileName) return { 
      icon: 'file-document-outline', 
      color: isDarkTheme ? '#888888' : themeColors.textSecondary 
    };
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (!extension || extension === fileName) {
      return { 
        icon: 'file-document-outline', 
        color: isDarkTheme ? '#888888' : themeColors.textSecondary 
      };
    }
    
    if (isDarkTheme) {
      switch(extension) {
        case 'pdf':
          return { icon: 'file-pdf-box', color: '#D0A8A0' };
        case 'doc':
        case 'docx':
          return { icon: 'file-word-box', color: '#9DB4C8' };
        case 'xls':
        case 'xlsx':
          return { icon: 'file-excel-box', color: '#A8C4A8' };
        case 'ppt':
        case 'pptx':
          return { icon: 'file-powerpoint-box', color: '#D4BDA0' };
        case 'zip':
        case 'rar':
        case '7z':
          return { icon: 'folder-zip', color: '#D4BDA0' };
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
          return { icon: 'file-image', color: '#C4ADC8' };
        case 'mp4':
        case 'avi':
        case 'mkv':
        case 'mov':
          return { icon: 'file-video', color: '#D0A8A0' };
        case 'mp3':
        case 'wav':
        case 'flac':
          return { icon: 'file-music', color: '#9DB4C8' };
        case 'txt':
          return { icon: 'file-document', color: '#B0B0B0' };
        default:
          return { icon: 'file-document-outline', color: '#888888' };
      }
    } else {
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
          return { icon: 'file-document-outline', color: themeColors.textSecondary };
      }
    }
  }

  if(loading) return (<LoadingScreen text={`Cargando ${nom_blo}`}/>)
  
  if(viewAlertVencida) return (
    <PaperMessages
      dismissable
      title='Actividad no disponible'
      visible={viewAlertVencida}
      message='Esta actividad se encuentra vencida, puedes pedirle a tu profesor si la habilita.'
      buttonText='Aceptar'
      onDismiss = {() => setViewAlertVencida(false)}
      pressButton = {() => setViewAlertVencida(false)}
      colorTitle={colors.error}
    />
  )

  const urlImagen = 'https://plataforma.ahjende.com/fondos_clase/' + imagenBloque;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: 120 + insets.bottom } // 🔥 AJUSTADO: Espacio para ChatAlumno + safe area
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.textPrimary}
              colors={[themeColors.textPrimary]}
            />
          }
        >
          <ImageBackground
            source={{ uri: urlImagen }}
            style={[styles.heroImage, { paddingTop: insets.top }]} // 🔥 SAFE AREA TOP en hero
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroOverlay} />
            
            <TouchableOpacity 
              onPress={() => navigation.pop()} 
              style={styles.backButton} // 🔥 Ya no necesita top dinámico, el padre tiene padding
              activeOpacity={0.9}
            >
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle} numberOfLines={2}>{nom_blo}</Text>
              {des_blo && <Text style={styles.heroSubtitle} numberOfLines={2}>{des_blo}</Text>}
            </View>
          </ImageBackground>

          <View style={styles.contentWrapper}>
            <TouchableOpacity 
              style={[
                styles.videoButton, 
                { 
                  backgroundColor: isDarkTheme ? '#2A2F35' : themeColors.textPrimary,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  borderWidth: isDarkTheme ? 1 : 0
                }
              ]}
              onPress={onPressVideoConference}
              activeOpacity={0.9}
            >
              <View style={[
                styles.videoIconContainer,
                { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)' }
              ]}>
                <Icon 
                  name="video" 
                  size={18} 
                  color={isDarkTheme ? '#9DB4C8' : themeColors.backgroundCard} 
                />
              </View>
              <Text style={[
                styles.videoButtonText, 
                { color: isDarkTheme ? '#9DB4C8' : themeColors.backgroundCard }
              ]}>
                Unirse a videoconferencia
              </Text>
              <Icon 
                name="chevron-right" 
                size={18} 
                color={isDarkTheme ? '#9DB4C8' : themeColors.backgroundCard} 
              />
            </TouchableOpacity>

            {conBlo !== '' && (
              <View style={styles.accordionWrapper}>
                <TouchableOpacity 
                  style={[
                    styles.accordionHeader, 
                    { 
                      backgroundColor: themeColors.backgroundCard,
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
                    }
                  ]}
                  onPress={toggleAccordion}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name="text-box-outline" 
                    size={18} 
                    color={themeColors.textPrimary} 
                  />
                  <Text style={[styles.accordionHeaderText, { color: themeColors.textPrimary }]}>
                    Contenido del bloque
                  </Text>
                  <Icon 
                    name={accordionOpen ? "chevron-up" : "chevron-down"} 
                    size={22} 
                    color={themeColors.textSecondary} 
                  />
                </TouchableOpacity>

                {accordionOpen && (
                  <View style={[
                    styles.accordionContent, 
                    { 
                      backgroundColor: isDarkTheme ? '#1a1a1a' : '#FFFFFF',
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
                    }
                  ]}>
                    <WebView
                      source={{ html: `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <style>
                              * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                              }
                              html, body {
                                width: 100%;
                                height: auto;
                                overflow-x: hidden;
                              }
                              body { 
                                padding: 16px;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                                font-size: 14px;
                                line-height: 1.6;
                                color: ${isDarkTheme ? '#e0e0e0' : '#1a1a1a'};
                                background-color: ${isDarkTheme ? '#1a1a1a' : '#FFFFFF'};
                              }
                              img { 
                                max-width: 100% !important; 
                                width: auto !important;
                                height: auto !important;
                                display: block;
                                margin: 8px 0;
                                ${isDarkTheme ? 'opacity: 0.9;' : ''}
                              }
                              table {
                                max-width: 100% !important;
                                width: 100% !important;
                                border-collapse: collapse;
                                display: block;
                                overflow-x: auto;
                              }
                              p, div, span, li {
                                max-width: 100% !important;
                                word-wrap: break-word;
                                overflow-wrap: break-word;
                              }
                              h1, h2, h3, h4, h5, h6 {
                                color: ${isDarkTheme ? '#ffffff' : '#1a1a1a'};
                                margin-top: 1em;
                                margin-bottom: 0.5em;
                                word-wrap: break-word;
                              }
                              a {
                                color: ${isDarkTheme ? '#60a5fa' : '#2563eb'};
                                word-wrap: break-word;
                              }
                              strong, b {
                                color: ${isDarkTheme ? '#ffffff' : '#000000'};
                              }
                              ul, ol {
                                padding-left: 20px;
                              }
                            </style>
                          </head>
                          <body>
                            ${conBlo}
                            <script>
                              function updateHeight() {
                                const height = document.body.scrollHeight;
                                window.ReactNativeWebView.postMessage(height);
                              }
                              
                              const images = document.getElementsByTagName('img');
                              let loadedImages = 0;
                              
                              if (images.length === 0) {
                                updateHeight();
                              } else {
                                for (let img of images) {
                                  img.onload = () => {
                                    loadedImages++;
                                    if (loadedImages === images.length) {
                                      updateHeight();
                                    }
                                  };
                                  img.onerror = () => {
                                    loadedImages++;
                                    if (loadedImages === images.length) {
                                      updateHeight();
                                    }
                                  };
                                }
                              }
                              
                              setTimeout(updateHeight, 300);
                            </script>
                          </body>
                        </html>
                      `}}
                      style={{ height: webViewHeight }}
                      scalesPageToFit={false}
                      scrollEnabled={false}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      bounces={false}
                      onMessage={(event) => {
                        const height = Number(event.nativeEvent.data);
                        if (height > 0 && height !== webViewHeight) {
                          setWebViewHeight(height + 40);
                        }
                      }}
                    />
                  </View>
                )}
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Icon name="book-open-variant" size={18} color={themeColors.textPrimary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Recursos teóricos</Text>
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
                    iconColor = isDarkTheme ? '#9DB4C8' : themeColors.textPrimary;
                    break;
                  case 'Archivo':
                    const fileInfo = getFileIconAndColor(recurso.arc_arc);
                    icon = fileInfo.icon;
                    iconColor = fileInfo.color;
                    break;
                  default:
                    icon = 'file';
                    iconColor = isDarkTheme ? '#888888' : themeColors.textSecondary;
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
              <View style={[
                styles.emptyState, 
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  borderWidth: isDarkTheme ? 1 : 0
                }
              ]}>
                <Icon 
                  name="book-outline" 
                  size={48} 
                  color={isDarkTheme ? '#444444' : themeColors.borderGray} 
                />
                <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
                  No hay recursos teóricos
                </Text>
              </View>
            )}

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Icon name="clipboard-text" size={18} color={themeColors.textPrimary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Actividades</Text>
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
              <View style={[
                styles.emptyState, 
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  borderWidth: isDarkTheme ? 1 : 0
                }
              ]}>
                <Icon 
                  name="clipboard-outline" 
                  size={48} 
                  color={isDarkTheme ? '#444444' : themeColors.borderGray} 
                />
                <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
                  No hay actividades
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <ChatAlumno/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    // 🔥 paddingBottom ahora es dinámico arriba
  },
  heroImage: {
    width: '100%',
    minHeight: 180, // 🔥 CAMBIÓ: minHeight en lugar de height fijo
    justifyContent: 'flex-end',
    // 🔥 paddingTop dinámico arriba
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
    top: 12, // 🔥 FIJO: El padre (heroImage) ya tiene paddingTop con insets
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  videoButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  accordionWrapper: {
    marginBottom: 12,
    marginTop: 4,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  accordionHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  accordionContent: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
  },
});