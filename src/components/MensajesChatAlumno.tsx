import React, {useState,useRef,useEffect,useContext} from 'react'
import { View, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
// import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { colors, platformTheme } from '../theme/platformTheme';
import { isImage } from '../hooks/useValidations';
import ImageModal from 'react-native-image-modal';
import { fnDownloadFile } from '../hooks/useDownloads';
import { Button } from 'react-native-paper';
import cafeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { formatDateHour } from '../hooks/useFormats';
import { LoadingScreen } from '../screens/LoadingScreen';

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

export const MensajesChatAlumno = ({id_sal,welcomeMsg,id_pro,heightChatHistory=300,placeHolderInputTxt='Escribe al profesor...'}:MensajesChatAlumnoProps) => {
    const [mensajes, setMensajes] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [msgChat, setMsgChat] = useState('');
    const [idSala, setIdSala] = useState(id_sal);
    const [loadingMsgs, setLoadingMsgs] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);
    const { data_alumno } = useContext( AuthContext );
    let titleDate = '';
    let viewTitleDate = false;
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

    const loadMessages = async() => {
        const {data} = await cafeApi.get('mensaje',{params:{id_sal: idSala, usu_visto: data_alumno?.id_alu, tip_usu_visto: 'Alumno'}});
        // console.log('cargando mensajes');
        if(data.trans){
            setMensajes(data.data);
        }
        setLoadingMsgs(false);
    }
    const validarMensaje = async() => {
        if(msgChat.trim()!==""){
            // console.log({men_men: msgChat,arc_men:'',est_men:'Pendiente',tip_men: 'Alumno', use_men: data_alumno?.id_alu, id_sal: idSala});return;
            setEnviando(true);
            if(idSala!==0){//si ya existe una sala
                await enviarMensaje(idSala);
            }else{//si no existe la sala, primero se crea y luego se guarda el mensaje
                const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
                const {data} = await cafeApi.post('sala/salaEstudianteProfesor',{use_alu: data_alumno?.id_alu, use_pro: id_pro}, headers);
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
        const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
        const {data} = await cafeApi.post('mensaje',{men_men: msgChat,arc_men:'',est_men:'Pendiente',tip_men: 'Alumno', use_men: data_alumno?.id_alu, id_sal: id_sala}, headers);
        if(data.trans){
            await loadMessages();
            setMsgChat('');
        }
    }

    return (
        <View style={styles.containerMsgChatAlumno}>
            <ScrollView 
                style={[styles.chatHistory, {height: heightChatHistory as number || undefined}]}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current && scrollViewRef.current.scrollToEnd({ animated: true })}
            >
                {welcomeMsg}
                {
                    loadingMsgs ? 
                        <LoadingScreen text='CARGANDO MENSAJES...'/>
                    :
                        mensajes.length>0 && 
                            mensajes.map((mensaje:respMsg)=>{
                                const msgAlumn = data_alumno?.id_alu===mensaje.use_men ? true : false;
                                const isImg = isImage(mensaje.arc_men);
                                const fecHorMen = formatDateHour(mensaje.hor_men, '/');
                                const [fecha,hora,amPm] = fecHorMen.split(' ');
                                const [hor,min,seg] = hora.split(':');
                                // console.log(mensaje);
                                if(titleDate!==fecha){
                                    titleDate=fecha;
                                    viewTitleDate = true;
                                }else{
                                    viewTitleDate = false;
                                }
                                return <View key={mensaje.id_men} style={[styles.containerMsg,{alignItems: msgAlumn ? 'flex-end' : 'flex-start'}]}>
                                    {
                                        viewTitleDate && <Text style={styles.titleDate}>
                                            {fecha}
                                        </Text>
                                    }
                                    {
                                        mensaje.men_men ?
                                            <View
                                                style={{
                                                        padding: 10,
                                                        backgroundColor: msgAlumn ? colors.chatGreen : colors.softSilver,
                                                        borderRadius: 10,
                                                }}
                                            >
                                                <View style={platformTheme.fila}>
                                                    <Text style={styles.txtTipUsuMsg}>{mensaje.tip_men}</Text>
                                                    <Text style={styles.txtUsuMsg}>{mensaje.nom_usu_men}</Text>
                                                </View>
                                                <Text style={{color: 'black',fontSize: 16}}>{mensaje.men_men}</Text>
                                                <Text style={{color: colors.darkBlue,alignSelf: 'flex-end'}}>
                                                    {`${hor}:${min} ${amPm} `}
                                                    {msgAlumn && 'E'}
                                                    {/* {msgAlumn && <FontAwesome5Icon style={{fontSize: 14, fontWeight: 'bold', color: mensaje.est_men_dest==='Entregado' ? colors.darkSilver : colors.success}} name='check-circle'/>} */}
                                                </Text>
                                            </View>
                                        :
                                            mensaje.arc_men && 
                                                <View style={styles.containerMsgFile}>
                                                    <View style={[platformTheme.fila, {marginBottom: 10}]}>
                                                        <Text style={styles.txtTipUsuMsg}>{mensaje.tip_men}</Text>
                                                        <Text style={styles.txtUsuMsg}>{mensaje.nom_usu_men}</Text>
                                                    </View>
                                                    {
                                                        isImg && <ImageModal
                                                            resizeMode="contain"
                                                            imageBackgroundColor='#000'
                                                            style={{
                                                                width: 250,
                                                                height: 250,
                                                            }}
                                                            source={{
                                                                uri: 'https://plataforma.ahjende.com/archivos/'+mensaje.arc_men,
                                                            }}
                                                        />
                                                    }
                                                        <Button
                                                            icon="arrow-down"
                                                            color='black'
                                                            onPress={()=>fnDownloadFile('https://plataforma.ahjende.com/archivos/'+mensaje.arc_men,mensaje.arc_men ?? '')}
                                                            style={ {alignContent:'flex-start', alignItems: 'flex-start'} }
                                                        >
                                                            {mensaje.arc_men}
                                                        </Button>
                                                        <Text style={{color: colors.darkBlue,alignSelf: 'flex-end'}}>
                                                            {`${hor}:${min} ${amPm}`}
                                                            {msgAlumn && 'E'}
                                                            {/* {msgAlumn && <FontAwesome5Icon style={{fontSize: 14, fontWeight: 'bold', color: mensaje.est_men_dest==='Entregado' ? colors.darkSilver : colors.success}} name='check-circle'/>} */}
                                                        </Text>
                                                </View>
                                    }
                                </View>
                            })
                }
            </ScrollView>
            <View style={styles.containerTxtInputChat}>
                <TextInput
                    multiline
                    numberOfLines={2}
                    editable
                    onChangeText={text => setMsgChat(text)}
                    style={styles.inputTxtInputChat}
                    placeholder={placeHolderInputTxt}
                    value={msgChat}
                />
                {   
                    enviando ?
                        <Text style={styles.iconSendMsg}>...</Text>
                    :
                        <Text>
                          {'->'}
                        </Text>
                        // <FontAwesome5Icon 
                        //     name='arrow-right'
                        //     style={styles.iconSendMsg}
                        //     onPress={validarMensaje}
                        // />
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerMsgChatAlumno: {
        flex: 1,
        marginHorizontal: 10
    },
    chatHistory: {
        marginVertical: 10,
    },
    containerMsg: {
        marginBottom: 5,
    },
    containerMsgFile: {
        padding: 10,
        backgroundColor: colors.softSilver,
        borderRadius: 5,
    },
    containerTxtInputChat:{
        flexDirection: 'row',
        maxHeight: 100,
        minHeight: 50
    },
    inputTxtInputChat: {
        padding: 10,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.softSilver,
        fontSize: 15,
        flex: 1,
        marginRight: 5,
    },
    iconSendMsg: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 18,
        color: 'white',
        backgroundColor: colors.success,
        padding: 10,
        borderRadius: 30,
    },
    txtTipUsuMsg: {
        backgroundColor: colors.yellow,
        paddingHorizontal: 5,
        borderRadius: 10
    },
    txtUsuMsg: {
        color: colors.darkBlue,
        fontWeight: 'bold',
        marginLeft: 5,
        fontSize: 16
    },
    titleDate: {
        alignSelf: 'center',
        backgroundColor: colors.darkBlue,
        padding: 5,
        marginVertical: 10,
        color: 'white',
        borderRadius: 10,
        fontWeight: 'bold'
    }
});