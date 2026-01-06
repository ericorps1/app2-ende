import React, {useState,useRef,useEffect,useContext} from 'react'
import { View, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { isImage } from '../hooks/useValidations';
import ImageModal from 'react-native-image-modal';
import { fnDownloadFile } from '../hooks/useDownloads';
import endeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { formatDateHour } from '../hooks/useFormats';
import { LoadingScreen } from '../screens/LoadingScreen';
import { useTheme } from '../context/ThemeContext';

interface MensajesChatAlumnoProps {
    id_sal: number;
    welcomeMsg: JSX.Element;
    id_pro: number;
    heightChatHistory?: number|string;
    placeHolderInputTxt?: string;
}

interface respMsg {
    id_men: number;
    arc_men : string|null;
    est_men: "Pendiente" | "Entregado";
    hor_men: string;
    id_sal4: number;
    men_men: string;
    tip_men: "Alumno" | "Profesor";
    use_men: number;
    nom_usu_men: string;
    est_men_dest: 'Entregado' | 'Visto';
}

export const MensajesChatAlumno = ({id_sal,welcomeMsg,id_pro,heightChatHistory=300,placeHolderInputTxt='Escribe un mensaje...'}:MensajesChatAlumnoProps) => {
  const { colors: themeColors, theme } = useTheme();
  const [mensajes, setMensajes] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [msgChat, setMsgChat] = useState('');
  const [idSala, setIdSala] = useState(id_sal);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { data_alumno } = useContext( AuthContext );
  
  let titleDate = '';
  let viewTitleDate = false;

  const msgSentBg = theme === 'dark' ? '#FFFFFF' : '#000000';
  const msgSentText = theme === 'dark' ? '#000000' : '#FFFFFF';
  const msgReceivedBg = themeColors.backgroundCard;
  const msgReceivedText = themeColors.textPrimary;

  useEffect(() => {
    loadMessages();
    const intervalMsgs = setInterval(()=>{
      loadMessages();
    },5000);
    return () => {
      setMensajes([]);
      clearInterval(intervalMsgs);
    }
  }, [idSala])

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const loadMessages = async() => {
      const {data} = await endeApi.get('mensaje',{params:{id_sal: idSala, usu_visto: data_alumno?.id_alu, tip_usu_visto: 'Alumno'}});
      if(data.trans){
        setMensajes(data.data);
      }
      setLoadingMsgs(false);
  }

  const validarMensaje = async() => {
    if(msgChat.trim()!==""){
      setEnviando(true);
      if(idSala!==0){
        await enviarMensaje(idSala);
      }else{
        const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
        const {data} = await endeApi.post('sala/salaEstudianteProfesor',{use_alu: data_alumno?.id_alu, use_pro: id_pro}, headers);
        if(data.trans){
          setIdSala(data.id_sal);
          await enviarMensaje(data.id_sal);
        }
      }
      setEnviando(false);
      setMsgChat('');
    }
  }

  const enviarMensaje = async(id_sala:number) => {
    try {
      const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
      const {data} = await endeApi.post('mensaje',{men_men: msgChat,arc_men:'',est_men:'Pendiente',tip_men: 'Alumno', use_men: data_alumno?.id_alu, id_sal: id_sala}, headers);
      if(data.trans){
          await loadMessages();
          setMsgChat('');
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView 
        style={[styles.chatHistory, {height: heightChatHistory as number || undefined}]}
        contentContainerStyle={styles.chatContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current && scrollViewRef.current.scrollToEnd({ animated: true })}
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
        {welcomeMsg}
        
        {loadingMsgs ? (
          <LoadingScreen text='Cargando mensajes...'/>
        ) : mensajes.length > 0 ? (
          mensajes.map((mensaje:respMsg)=>{
            const msgAlumn = data_alumno?.id_alu===mensaje.use_men;
            const isImg = isImage(mensaje.arc_men);
            const fecHorMen = formatDateHour(mensaje.hor_men, '/');
            const [fecha,hora,amPm] = fecHorMen.split(' ');
            const [hor,min,seg] = hora.split(':');
            
            if(titleDate!==fecha){
              titleDate=fecha;
              viewTitleDate = true;
            }else{
              viewTitleDate = false;
            }

            return (
              <View key={mensaje.id_men} style={[styles.messageContainer, msgAlumn && styles.messageContainerRight]}>
                {viewTitleDate && (
                  <View style={styles.dateDivider}>
                    <View style={[styles.dateLine, { backgroundColor: themeColors.borderGray }]} />
                    <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>{fecha}</Text>
                    <View style={[styles.dateLine, { backgroundColor: themeColors.borderGray }]} />
                  </View>
                )}
                
                {mensaje.men_men ? (
                  <View style={[
                    styles.messageBubble, 
                    msgAlumn 
                      ? [styles.messageBubbleSent, { backgroundColor: msgSentBg }]
                      : [styles.messageBubbleReceived, { backgroundColor: msgReceivedBg }]
                  ]}>
                    <View style={styles.messageHeader}>
                      <View style={[
                        styles.typeBadge, 
                        msgAlumn 
                          ? { backgroundColor: 'rgba(0,0,0,0.1)' }
                          : [styles.typeBadgeReceived, { backgroundColor: themeColors.backgroundGray }]
                      ]}>
                        <Text style={[
                          styles.typeText, 
                          msgAlumn 
                            ? { color: msgSentText }
                            : { color: themeColors.textSecondary }
                        ]}>
                          {mensaje.tip_men}
                        </Text>
                      </View>
                      <Text style={[
                        styles.userName, 
                        msgAlumn 
                          ? { color: msgSentText, opacity: 0.7 }
                          : { color: themeColors.textSecondary }
                      ]}>
                        {mensaje.nom_usu_men}
                      </Text>
                    </View>
                    
                    <Text style={[
                      styles.messageText, 
                      msgAlumn 
                        ? { color: msgSentText }
                        : { color: msgReceivedText }
                    ]}>
                      {mensaje.men_men}
                    </Text>
                    
                    <View style={styles.messageFooter}>
                      <Text style={[
                        styles.timeText, 
                        msgAlumn 
                          ? { color: msgSentText, opacity: 0.6 }
                          : { color: themeColors.textTertiary }
                      ]}>
                        {`${hor}:${min} ${amPm}`}
                      </Text>
                      {msgAlumn && (
                        <Icon 
                          name={mensaje.est_men_dest === 'Visto' ? 'check-all' : 'check'} 
                          size={14} 
                          color={mensaje.est_men_dest === 'Visto' ? '#34C759' : (theme === 'dark' ? '#666' : '#999')} 
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </View>
                ) : mensaje.arc_men && (
                  <View style={[
                    styles.fileBubble, 
                    msgAlumn 
                      ? [styles.fileBubbleSent, { backgroundColor: msgSentBg }]
                      : [styles.fileBubbleReceived, { backgroundColor: msgReceivedBg }]
                  ]}>
                    <View style={styles.messageHeader}>
                      <View style={[
                        styles.typeBadge, 
                        msgAlumn 
                          ? { backgroundColor: 'rgba(0,0,0,0.1)' }
                          : [styles.typeBadgeReceived, { backgroundColor: themeColors.backgroundGray }]
                      ]}>
                        <Text style={[
                          styles.typeText, 
                          msgAlumn 
                            ? { color: msgSentText }
                            : { color: themeColors.textSecondary }
                        ]}>
                          {mensaje.tip_men}
                        </Text>
                      </View>
                      <Text style={[
                        styles.userName, 
                        msgAlumn 
                          ? { color: msgSentText, opacity: 0.7 }
                          : { color: themeColors.textSecondary }
                      ]}>
                        {mensaje.nom_usu_men}
                      </Text>
                    </View>
                    
                    {isImg && (
                      <ImageModal
                        resizeMode="contain"
                        imageBackgroundColor='#000'
                        style={styles.messageImage}
                        source={{ uri: 'https://plataforma.ahjende.com/archivos/'+mensaje.arc_men }}
                      />
                    )}
                    
                    <TouchableOpacity 
                      style={[styles.downloadButton, { 
                        backgroundColor: msgAlumn 
                          ? 'rgba(0,0,0,0.1)' 
                          : themeColors.backgroundGray 
                      }]}
                      onPress={()=>fnDownloadFile('https://plataforma.ahjende.com/archivos/'+mensaje.arc_men,mensaje.arc_men ?? '')}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name="download" 
                        size={18} 
                        color={msgAlumn ? msgSentText : themeColors.textSecondary} 
                      />
                      <Text style={[
                        styles.downloadText, 
                        { color: msgAlumn ? msgSentText : themeColors.textSecondary }
                      ]} numberOfLines={1}>
                        {mensaje.arc_men}
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.messageFooter}>
                      <Text style={[
                        styles.timeText, 
                        msgAlumn 
                          ? { color: msgSentText, opacity: 0.6 }
                          : { color: themeColors.textTertiary }
                      ]}>
                        {`${hor}:${min} ${amPm}`}
                      </Text>
                      {msgAlumn && (
                        <Icon 
                          name={mensaje.est_men_dest === 'Visto' ? 'check-all' : 'check'} 
                          size={14} 
                          color={mensaje.est_men_dest === 'Visto' ? '#34C759' : (theme === 'dark' ? '#666' : '#999')} 
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </View>
                )}
              </View>
            )
          })
        ) : (
          <View style={styles.emptyState}>
            <Icon name="message-outline" size={64} color={themeColors.borderGray} />
            <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>No hay mensajes</Text>
            <Text style={[styles.emptyStateSubtext, { color: themeColors.textTertiary }]}>Inicia la conversación</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { 
        backgroundColor: themeColors.backgroundCard,
        borderTopColor: themeColors.borderGray 
      }]}>
        <View style={[styles.inputWrapper, { backgroundColor: themeColors.backgroundGray }]}>
          <TextInput
            multiline
            numberOfLines={2}
            editable={!enviando}
            onChangeText={text => setMsgChat(text)}
            style={[styles.textInput, { color: themeColors.textPrimary }]}
            placeholder={placeHolderInputTxt}
            placeholderTextColor={themeColors.textTertiary}
            value={msgChat}
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: theme === 'dark' ? '#FFFFFF' : '#000000' },
            enviando && styles.sendButtonDisabled
          ]}
          onPress={validarMensaje}
          disabled={enviando || msgChat.trim() === ''}
          activeOpacity={0.7}
        >
          {enviando ? (
            <Icon name="loading" size={22} color={theme === 'dark' ? '#000000' : '#FFFFFF'} />
          ) : (
            <Icon name="send" size={22} color={theme === 'dark' ? '#000000' : '#FFFFFF'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHistory: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageContainerRight: {
    alignItems: 'flex-end',
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
    width: '100%',
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleReceived: {
    borderBottomLeftRadius: 4,
  },
  messageBubbleSent: {
    borderBottomRightRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  typeBadgeReceived: {
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'NotoColorEmoji',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  fileBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileBubbleReceived: {
    borderBottomLeftRadius: 4,
  },
  fileBubbleSent: {
    borderBottomRightRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    gap: 8,
  },
  downloadText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 0,
    fontFamily: 'NotoColorEmoji',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#999',
  },
});