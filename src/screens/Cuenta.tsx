import React, {useContext, useState, useEffect} from 'react'
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Portal, TextInput, Modal, Text, Button, Provider, Avatar, Divider, DefaultTheme } from 'react-native-paper';
import { platformTheme, colors } from '../theme/platformTheme';
import { FormatNameAvatar } from '../hooks/useFormats';
import { DataProfileAlumno, TypesMsgModalType } from '../interfaces/appInterfaces';
import cafeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { isEmail, valFormInput } from '../hooks/useValidations';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useUploads } from '../hooks/useUploads';
import { GradientBackground } from '../components/GradientBackground';
import { ModalMessages } from '../components/ModalMessages';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Cuenta = () => {
    const { data_alumno, checkToken } = useContext( AuthContext );
    const [infoAlumno, setInfoAlumno] = useState<DataProfileAlumno|any>([]);
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [modalText, setModalText] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);
    const [typeMsgModal, setTypeMsgModal] = useState<TypesMsgModalType>('success')
    const [newProfilePic, setNewProfilePic] = useState('')
    const [uploading, setUploading] = useState(false)
    const [modalContrasena, setModalContrasena] = useState(false)
    const [infoContra, setInfoContra] = useState({ante_con: '', nuev_con: '', conf_con:''})
    const [loadingActuCont, setLoadingActuCont] = useState(false)
    const [objImg, setObjImg] = useState<ImagePickerResponse>()
    const [visible, setVisible] = useState(false);

    const getDataProfile = async () => {
        try { 
            const {data} = await cafeApi.get('/alumno/'+data_alumno?.id_alu);
            if(data.data.length>0){
                const {tel_alu,dir_alu,col_alu,del_alu,ent_alu,cor1_alu,cur_alu} = data.data[0];
                setInfoAlumno({
                  tel_alu,
                  dir_alu,
                  col_alu,
                  del_alu,
                  ent_alu,
                  cor1_alu,
                  cur_alu
                });
            }else{
                setInfoAlumno([]);
            }
            setLoadingAccount(false);
        } catch (error:any) {
            console.log('getDataProfile',error);
        }
    }

    useEffect(() => {
        getDataProfile();
    }, [])

    
    const updateInfo = async () => {
        const valTel = valFormInput(infoAlumno.tel_alu, 'Teléfono', 1, 10, true);
        if(valTel!==true){
            setModalText(valTel);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valDir = valFormInput(infoAlumno.dir_alu, 'Dirección', 1, 100);
        if(valDir!==true){
            setModalText(valDir);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valCol = valFormInput(infoAlumno.col_alu, 'Colonia', 1, 200);
        if(valCol!==true){
            setModalText(valCol);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valDel = valFormInput(infoAlumno.del_alu, 'Delegación', 1, 200);
        if(valDel!==true){
            setModalText(valDel);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valEnt = valFormInput(infoAlumno.ent_alu, 'Entidad', 1, 200);
        if(valEnt!==true){
            setModalText(valEnt);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valPersonalEmail = isEmail(infoAlumno.cor1_alu, 'Correo electrónico personal');
        if(valPersonalEmail!==true){
            setModalText(valPersonalEmail);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valSegSocial = valFormInput(infoAlumno.cur_alu, 'Seguro social', 1, 200);
        if(valSegSocial!==true){
            setModalText(valSegSocial);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        setLoadingForm(true);
        try { 
            const config = {headers:{ 'Content-Type':'text/plain' }};
            const { data } = await cafeApi.put('/alumno/'+data_alumno?.id_alu, JSON.stringify(infoAlumno), config)
            if(data.trans===true){
                setModalText('Su información ha sido actualizada exitosamente.');
                setTypeMsgModal('success');
                setVisible(true);
            }else{
                setModalText('No se puedo actualizar su información, por favor, vuelva a intentarlo.\n'+data.msg);
                setTypeMsgModal('error');
                setVisible(true);
            }
        } catch (error:any) {
            setModalText('Error inesperado, por favor, contacte a soporte si el problema persiste.');
            setTypeMsgModal('error');
            setVisible(true);
        }
        setLoadingForm(false);
    }

    const getPhoto = async (type:'photo'|'img') => {
        let result:any = { assets: undefined };
        if(type==='photo'){
            result = await launchCamera({mediaType: 'photo', cameraType: 'front', maxWidth: 500, maxHeight: 500});
        }else{
            result = await launchImageLibrary({mediaType: 'photo', maxWidth: 500, maxHeight: 500});
        }
        if(result.assets){
            setObjImg(result);
            setNewProfilePic(result.assets[0].uri);
        }
    }

    const uploadImg = async() => {
        try { 
            if(!objImg) return false;
            if(!objImg.assets) return false;
            if(!objImg.assets[0]) return false;
            setUploading(true);
            const { upload, filename } = await useUploads('/alumno/'+data_alumno?.id_alu, objImg.assets[0]);
            if(upload===true){
                await checkToken();
            }
            setUploading(false);
            setNewProfilePic('');
            setModalText('La foto del perfil ha sido actualizada exitosamente.');
            setTypeMsgModal('success');
            setVisible(true);
        } catch (error:any) {
            setModalText('Error inesperado, por favor, contacte a soporte si el problema persiste.');
            setTypeMsgModal('error');
            setVisible(true);
            console.log('uploadImg =>>>> ',error);
        }
    }

    const cambiarContrasena = async() => {
        const {ante_con, nuev_con, conf_con} = infoContra;
        const valAntCont = valFormInput(ante_con, 'Contraseña anterior', 4, 20);
        if(valAntCont!==true){
            setModalText(valAntCont);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valNewCont = valFormInput(nuev_con, 'Nueva contraseña', 4, 20);
        if(valNewCont!==true){
            setModalText(valNewCont);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        const valConfCont = valFormInput(conf_con, 'Confirmar contraseña', 4, 20);
        if(valConfCont!==true){
            setModalText(valConfCont);
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        if(nuev_con!==conf_con){
            setModalText('Las contraseñas deben coincidir.');
            setTypeMsgModal('error');
            setVisible(true);
            return;
        }
        try { 
            setLoadingActuCont(true);
            const config = {headers:{ 'Content-Type':'text/plain' }};
            const { data } = await cafeApi.put('/alumno/'+data_alumno?.id_alu, JSON.stringify(infoContra), config)
            if(data.trans===true){
                setModalText('La contraseña ha sido actualizada exitosamente.');
                setTypeMsgModal('success');
                setVisible(true);
                setInfoContra({ante_con: '', nuev_con: '', conf_con:''});
                setModalContrasena(false);
            }else if(data.msg){
                setModalText(data.msg);
                setTypeMsgModal('error');
                setVisible(true);
            }else{
                setModalText('No se puedo actualizar su información, por favor, vuelva a intentarlo.\n'+data.msg);
                setTypeMsgModal('error');
                setVisible(true);
            }
        } catch (error:any) {
            setModalText('Error inesperado, por favor, contacte a soporte si el problema persiste.');
            setTypeMsgModal('error');
            setVisible(true);
        }
        setLoadingActuCont(false);
    }
    return (
        (loadingAccount) 
        ? <LoadingScreen/>
        : <Provider theme={DefaultTheme}>
            <Portal>
                <ScrollView>
                    <GradientBackground primaryColor={'#000000'} secondaryColor={'#FFFFFF'}>
                        <View style={ styles.viewAvatar }>
                            { (data_alumno?.fot_alu || newProfilePic!=='') 
                                ? (
                                    <Image 
                                        source={{ uri: (newProfilePic==='') ? 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu : newProfilePic}}
                                        style={ platformTheme.avatar }
                                    />
                                )
                                : (
                                    <Avatar.Text style={ platformTheme.avatar } label={FormatNameAvatar(data_alumno?.nom_alu)} />
                                )
                            }
                            <Text style={ platformTheme.avatarName }> { data_alumno?.nom_alu } </Text>
                            <View style={ [styles.buttonList, platformTheme.fila] }>
                                {   (newProfilePic==='')
                                ?   (
                                        <>
                                            <Button 
                                                icon={() => <Icon name="bell" size={20} color="white" />}
                                                textColor='white'
                                                onPress={() => getPhoto('photo')}
                                                style={ [platformTheme.btnInfo, platformTheme.btn] }
                                            >CAMARA</Button>
                                            <Button
                                                icon="image"
                                                textColor='white'
                                                onPress={() => getPhoto('img')}
                                                style={ [platformTheme.btnSuccess, platformTheme.btn] }
                                            >GALERIA</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button 
                                                icon="pencil"
                                                textColor='white'
                                                onPress={ () => uploadImg() }
                                                style={ [platformTheme.btnSuccess, platformTheme.btn, styles.botonActualizar] }
                                                disabled={uploading}
                                                loading={ uploading }
                                            >{ !uploading ? 'ACTUALIZAR' : 'SUBIENDO...' }</Button>
                                            <Button 
                                                icon="cancel"
                                                textColor='white'
                                                onPress={ () => setNewProfilePic('') } 
                                                style={ [platformTheme.btnDanger, platformTheme.btn] }
                                                disabled={uploading}
                                            >Cancelar</Button>
                                        </>
                                    )
                                }
                            </View>
                        </View>
                    </GradientBackground>
                    <Divider/>
                    <View style={ styles.formContainer }>
                        <View style={{ flex:1 }}>
                            <Text style={ styles.title }> Información personal </Text>
                        </View>
                        <TextInput
                            keyboardType='phone-pad'
                            mode="outlined"
                            label="Teléfono"
                            placeholder="Ingrese su número de teléfono"
                            // right={<TextInput.Affix text="/100" />}
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.tel_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, tel_alu: value}) }
                        />
                        <Divider style={styles.divider}/>
                        <TextInput
                            mode="outlined"
                            label="Dirección"
                            placeholder="Ingrese su dirección"
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.dir_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, dir_alu: value}) }
                        />
                        <Divider style={styles.divider}/>
                        <TextInput
                            mode="outlined"
                            label="Colonia"
                            placeholder="Ingrese la colonia"
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.col_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, col_alu: value}) }
                        />
                        <Divider style={styles.divider}/>
                        <TextInput
                            mode="outlined"
                            label="Delegación"
                            placeholder="Ingrese su delegación"
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.del_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, del_alu: value}) }
                        />
                        <Divider style={styles.divider}/>
                        <TextInput
                            mode="outlined"
                            label="Entidad"
                            placeholder="Ingrese su entidad"
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.ent_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, ent_alu: value}) }
                        />
                        <Divider style={styles.divider}/>
                        <TextInput
                            mode="outlined"
                            label="Correo electrónico"
                            placeholder="Ingrese su correo electrónico personal"
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.cor1_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, cor1_alu: value}) }
                        />
                        <Divider style={styles.divider}/>
                        <TextInput
                            mode="outlined"
                            label="CURP"
                            placeholder="Ingrese su CURP"
                            activeOutlineColor={colors.primary}
                            value={ infoAlumno?.cur_alu }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoAlumno({...infoAlumno, cur_alu: value}) }
                        />
                        <View style={ [styles.buttonList, platformTheme.fila, {alignSelf:'center', marginTop: 10}] }>
                            <Button 
                                icon="pencil"
                                mode="contained"
                                onPress={ updateInfo }
                                disabled={ loadingForm }
                                loading={ loadingForm }
                                style={ [styles.botonActualizar, platformTheme.btn] }
                            >
                                Actualizar
                            </Button>
                            <Button 
                                icon="lock"
                                mode="contained"
                                onPress={ () => setModalContrasena(true) }
                                style={ [platformTheme.btnSuccess, platformTheme.btn] }
                            >
                                CONTRASEÑA
                            </Button>
                        </View>
                    </View>
                </ScrollView>
                <Modal visible={modalContrasena} onDismiss={()=>setModalContrasena(false)} contentContainerStyle={platformTheme.modalContainer}>
                    <View>
                        <Text style={ { ...styles.title, fontWeight: '600' } }>CAMBIAR CONTRASEÑA</Text>
                    </View>
                    <View>
                        <TextInput
                            secureTextEntry={true}
                            mode="outlined"
                            label="Contraseña anterior"
                            placeholder="Ingrese la contraseña actual de su cuenta"
                            activeOutlineColor={colors.primary}
                            value={ infoContra.ante_con }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoContra({...infoContra, ante_con: value}) }
                        />
                    </View>
                    <View>
                        <TextInput
                            secureTextEntry={true}
                            mode="outlined"
                            label="Nueva contraseña"
                            placeholder="Ingrese la nueva contraseña"
                            activeOutlineColor={colors.primary}
                            value={ infoContra.nuev_con }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoContra({...infoContra, nuev_con: value}) }
                        />
                    </View>
                    <View>
                        <TextInput
                            secureTextEntry={true}
                            mode="outlined"
                            label="Confirmar contraseña"
                            placeholder="Vuelva a ingresar la nueva contraseña"
                            activeOutlineColor={colors.primary}
                            value={ infoContra.conf_con }
                            style={ styles.inputStyle }
                            onChangeText={ (value) => setInfoContra({...infoContra, conf_con: value}) }
                        />
                    </View>
                    <View style={ [styles.buttonContainer, platformTheme.fila, {marginTop: 10, alignSelf:'center'}] }>
                        <Button 
                            icon='pencil'
                            onPress={ cambiarContrasena }
                            style={ [styles.botonCerrar, platformTheme.btn] }
                            textColor='white'
                            disabled={loadingActuCont}
                            loading={loadingActuCont}
                        >ACTUALIZAR</Button>
                        <Button 
                            icon='cancel'
                            onPress={ () => setModalContrasena(false) }
                            style={ [styles.botonCerrar, platformTheme.btn, platformTheme.btnDanger] }
                            textColor='white'
                            disabled={loadingActuCont}
                        >CANCELAR</Button>
                    </View>
                </Modal>
                <ModalMessages visible={visible} typeMsgModal={typeMsgModal} modalText={modalText} onDismiss={()=>setVisible(false)}/>
            </Portal>
        </Provider>
    )
}

const styles = StyleSheet.create({
    viewAvatar: {
        ...platformTheme.avatarContent,
        marginBottom: 20,
    },
    formContainer: {
        marginHorizontal: 20,
        marginVertical: 20,
    },
    buttonList: {
        alignItems: 'center'
    },
    title: {
        color: colors.darkBlue,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    inputStyle: {
        marginBottom: 5,
        height: 40,
        
    },
    botonActualizar: {
        backgroundColor: colors.primary,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    botonCerrar: {
        backgroundColor: colors.primary,
        color: 'white'
    },
    divider: {
        height: 1,
        backgroundColor: 'black',
        opacity: 0.2,
        marginVertical: 5
    },
});