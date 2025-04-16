import React, { useContext, useEffect, useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, useWindowDimensions, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { AuthContext } from '../context/AuthContext';
import { FilePick, PropsActividad, TypesMsgModalType } from '../interfaces/appInterfaces';
import RenderHtml, { CustomBlockRenderer } from 'react-native-render-html';
import DocumentPicker, { DocumentPickerOptions } from 'react-native-document-picker';
import { colors, platformTheme } from '../theme/platformTheme';
import { cleanHtmlRenderHtml, nombreGuionesMinus } from '../hooks/useFormats';
import cafeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { Button } from 'react-native-paper';
import { useUploads } from '../hooks/useUploads';
import { ModalMessages } from '../components/ModalMessages';
import WebView from 'react-native-webview';
import { baseUrlFiles } from '../hooks/useGlobal';
import { fnDownloadFile } from '../hooks/useDownloads';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { PaperConfirmEliminar } from '../components/PaperConfirmEliminar';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { HtmlToJsx } from '../components/HtmlToJsx';
import { ChatAlumno } from '../components/ChatAlumno';

export const Entregable = ({route,navigation}:PropsActividad) => {
    useEffect(() => {
      getEntregableAlu();
    }, [])
    const initialStateObFile = { fileCopyUri: null, name: "", size: 0, type: "", uri: "" };
    const { data_alumno } = useContext( AuthContext );
    const {identificador,titulo,descripcion,identificador_copia,nom_blo,nom_mat} = route.params.data_actividad;
    const [infoRespTarea, setInfoRespTarea] = useState<any>([]);
    const [obFile, setObFile] = useState<FilePick>(initialStateObFile);
    const [loading, setLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [typeMsg, setTypeMsg] = useState<TypesMsgModalType>('success');
    const [titleEliminar, setTitleEliminar] = useState('');
    const [textEliminar, setTextEliminar] = useState('');
    //funcion para consultar si el alumno ya subio un entregable para esta actividad
    const getEntregableAlu = async () => {
        const {data} = await cafeApi.get('/tarea', {params: {id_ent_cop: identificador_copia, id_alu_ram: data_alumno?.id_alu_ram}});
        setLoading(true);
        if(data.trans){
            setInfoRespTarea(data.data);
        }else{
            setInfoRespTarea([]);
        }
        setLoading(false);
    }
    const { width } = useWindowDimensions();

    const handleError = (err: unknown) => {
        if (DocumentPicker.isCancel(err)) {
            console.log('cancelled', err)
            // User cancelled the picker, exit any dialogs or menus and move on
        } else {
            throw err
        }
    }

    const loadFile = async () => {
        try {
            const file:any = await DocumentPicker.pickSingle();
            setObFile(file);
        } catch (error) {
            handleError(error);
        }
        // console.log(resp);
    }

    const getPhoto = async (type:'photo'|'img') => {
        let result:any = { assets: undefined };
        if(type==='photo'){
            result = await launchCamera({mediaType: 'photo', cameraType: 'front', maxWidth: 500, maxHeight: 500});
        }else{
            result = await launchImageLibrary({mediaType: 'photo', maxWidth: 500, maxHeight: 500});
        }
        // console.log('resultado=>>',result);
        if(result.assets){
            setObFile({...result.assets[0], name: result.assets[0].fileName});
        }
    }

    const uploadFile = async () => {
        const arrFileName = obFile.name.split('.');
        const fileExt = arrFileName[arrFileName.length-1];
        try { 
            if(obFile.name==="") return false;
            setLoading(true);
            const serverFileName = `${nombreGuionesMinus(data_alumno?.nom_gen+'-'+data_alumno?.nom_alu+'-'+nom_blo+'-'+titulo+'-'+nom_mat)}.${fileExt}`;
            const resp = await useUploads(  '/tarea/', 
                                                            {...obFile, fileName: serverFileName}, 
                                                            {doc_tar: obFile.name, id_ent_cop: identificador_copia, id_alu_ram: data_alumno?.id_alu_ram}
                                                        );
            setLoading(false);
            if(resp.trans===true){
                setTypeMsg('success');
                setAlertMsg('Actividad entregada exitosamente.');
                setObFile(initialStateObFile);
            }else{
                setTypeMsg('error');
                setAlertMsg('La actividad no se pudo entregar, por favor, vuelva a intentarlo. \n'+resp.msg);
            }
            setLoading(false);
        } catch (error:any) {
            setTypeMsg('error');
            setAlertMsg('Error inesperado, por favor, contacte a soporte si el problema persiste.');
            console.log('uploadFile =>>>> ',error);
        }
        getEntregableAlu();
    }

    const downloadFileFunc = () => {
        fnDownloadFile(baseUrlFiles+infoRespTarea[0].doc_tar, infoRespTarea[0].doc_tar);
    }

    const pressDelete = () => {
        setTitleEliminar('¿ELIMINAR ENTREGABLE?');
        setTextEliminar('¿Seguro que desea eliminar el entregable?, esta acción es irrevertible.');
    }

    const eliminarTarea = async () => {
        setLoading(true);
        const {data} = await cafeApi.delete('/tarea/'+infoRespTarea[0]?.id_tar);
        if(data.trans===true){
            setTypeMsg('success');
            setAlertMsg('Entrega eliminada exitosamente.');
            setTitleEliminar('');setTextEliminar('');
        }else{
            setTypeMsg('error');
            setAlertMsg('La entrega no se pudo eliminar, por favor, intentelo nuevamente.');
        }
        setLoading(false);
        getEntregableAlu();
    }

    loading && <LoadingScreen/>
    return (
        <SafeAreaView style={ styles.container }>
            <BackButtonNavigation onPressBack={() => navigation.pop()} title={titulo}/>
            <ScrollView style={{height: Dimensions.get("window").height}}>
                <View style={ styles.bodyEntDetalle }>
                    <View style={ styles.entPregunta }>
                        <HtmlToJsx strHtml={`<b>DESCRIPCIÓN:</b>${descripcion}`}/>
                        <View style={ styles.containerRespAct }>
                            {
                                infoRespTarea.length ?//si ya subio un archivo muestra la opcion descargar y eliminar
                                    <View style={styles.containerBtnDownload}>
                                        <Text style={styles.txtInfoFileToDownload}>{infoRespTarea[0].doc_tar}</Text>
                                        <View style={platformTheme.fila}>
                                            <Button
                                                disabled={loading}
                                                loading={loading}
                                                icon="arrow-down"
                                                color='white'
                                                onPress={()=>downloadFileFunc()}
                                                style={ [platformTheme.btnDownload, {margin: 5}] }
                                            >DESCARGAR</Button>
                                            <Button
                                                disabled={loading}
                                                loading={loading}
                                                icon="delete"
                                                color='white'
                                                onPress={pressDelete}
                                                style={ [platformTheme.btnDownload, {flex: 1, margin: 5, backgroundColor: colors.error, borderRadius: 10}] }
                                            >ELIMINAR</Button>
                                        </View>
                                    </View>
                                :
                                    obFile.uri ?
                                        <View>
                                            <Text style={ styles.txtFileName }>{obFile.name}</Text>
                                            <View style={{...platformTheme.fila, alignSelf: 'center'}}>
                                                <Button
                                                    disabled={loading}
                                                    loading={loading}
                                                    icon="arrow-up"
                                                    color='white'
                                                    onPress={uploadFile}
                                                    style={ [platformTheme.btnSuccess, platformTheme.btn] }
                                                >SUBIR ARCHIVO</Button>
                                                <Button
                                                    disabled={loading}
                                                    loading={loading}
                                                    icon="cancel"
                                                    color='white'
                                                    onPress={()=>setObFile(initialStateObFile)}
                                                    style={ [platformTheme.btnDanger, platformTheme.btn] }
                                                >CANCELAR</Button>
                                            </View>
                                        </View>
                                    :
                                        <View>
                                            <View style={ { ...platformTheme.fila, alignSelf: 'center', marginBottom: 10 } }>
                                                <Button 
                                                    loading={loading}
                                                    disabled={loading}
                                                    icon="camera"
                                                    color='white'
                                                    onPress={() => getPhoto('photo')}
                                                    style={ [platformTheme.btnInfo, platformTheme.btn, {flex: 1}] }
                                                >CAMARA</Button>
                                                <Button
                                                    loading={loading}
                                                    disabled={loading}
                                                    icon="image"
                                                    color='white'
                                                    onPress={() => getPhoto('img')}
                                                    style={ [platformTheme.btnDarkBlue, platformTheme.btn, {flex: 1}] }
                                                >GALERIA</Button>
                                            </View>
                                            <Button
                                                disabled={loading}
                                                loading={loading}
                                                icon="file"
                                                color='white'
                                                onPress={loadFile}
                                                style={ [platformTheme.btnSuccess, platformTheme.btn] }
                                            >SELECCIONAR ARCHIVO</Button>
                                        </View>
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={{paddingLeft: 20}}>
                <ChatAlumno/>
            </View>
            <ModalMessages
                visible={alertMsg!==''}
                typeMsgModal={typeMsg}
                modalText={alertMsg}
                onDismiss={()=>setAlertMsg('')}
            />
            <PaperConfirmEliminar
                visible={titleEliminar!==''}
                title={titleEliminar}
                text={textEliminar}
                evDismiss={()=>{setTitleEliminar('');setTextEliminar('');}}
                btnDisabled={loading}
                pressDelete={eliminarTarea}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 20,
        marginTop: 10,
    },
    bodyEntDetalle: { 
        flex: 1,
        justifyContent: 'flex-start',
        marginBottom: 50,
    },
    entPregunta: {
        backgroundColor: colors.softSilver,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginRight: 20,
        borderRadius: 10
    },
    containerRespAct: {
        backgroundColor: colors.softBlue,
        borderRadius: 10,
        padding: 10,
    },
    titleRepAct:{
        fontWeight: 'bold',
        fontSize: 20,
        color: colors.darkBlue,
    },
    txtFileName: {
        textAlign: 'center',
        padding: 10,
        fontSize: 18,
        color: colors.darkBlue,
    },
    textInfoFileUploaded: {
        color: colors.darkBlue,
        textAlign: 'center',
        fontSize: 15,
        marginBottom: 10
    },
    txtInfoFileToDownload: {
        textAlign: 'center',
        fontSize: 18,
        color: colors.darkBlue,
        marginBottom: 10
    },
    containerBtnDownload: {
        marginBottom: 20,
        backgroundColor: colors.softBlue,
        padding: 10,
        borderRadius: 10,
    }
});