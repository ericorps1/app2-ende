import React, {useContext, useState, useEffect} from 'react'
import { View, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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
import { requestCameraPermission } from '../hooks/usePermisions';
import RenderPdf from '../components/RenderUrlPdf';
import { AddDomiciliation } from '../components/AddDomiciliation';

const { width } = Dimensions.get('window');

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
    const [scrollEnabled, setScrollEnabled] = useState(true);
    
    const [domiciliation, setDomiciliation] = useState({
        isSaved: false,
        card_no: '',
        exp_month: '',
        exp_year: '',
        brand: ''
    });

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

    const getDomiciliation = async() => {
        try {
            const {data} = await cafeApi.get('/domiciliacion/' + data_alumno?.id_alu_ram || '');
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
            console.log('getDomiciliation', error);
        }
    };

    useEffect(() => {
        getDataProfile();
        getDomiciliation();
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
            const permission = await requestCameraPermission();
            if(!permission){
                setModalText('No se ha concedido el permiso para usar la cámara.');
                setTypeMsgModal('error');
                setVisible(true);
                return;
            }
            result = await launchCamera({mediaType: 'photo', cameraType: 'front', maxWidth: 500, maxHeight: 500});
        }else{
            result = await launchImageLibrary({mediaType: 'photo', maxWidth: 500, maxHeight: 500});
        }
        console.log('result',result);
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
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    scrollEnabled={scrollEnabled}
                    style={styles.container}
                >
                    {/* HEADER MINIMALISTA */}
                    <View style={styles.header}>
                        <View style={styles.avatarSection}>
                            <TouchableOpacity onPress={() => getPhoto('img')}>
                                { (data_alumno?.fot_alu || newProfilePic!=='') 
                                    ? (
                                        <Image 
                                            source={{ uri: (newProfilePic==='') ? 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu : newProfilePic}}
                                            style={ styles.avatar }
                                        />
                                    )
                                    : (
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{FormatNameAvatar(data_alumno?.nom_alu)}</Text>
                                        </View>
                                    )
                                }
                                <View style={styles.cameraIconBadge}>
                                    <Icon name="camera" size={16} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{data_alumno?.nom_alu}</Text>
                                <Text style={styles.userSubtitle}>{data_alumno?.estatus_general}</Text>
                            </View>
                        </View>
                        
                        {newProfilePic !== '' && (
                            <View style={styles.photoActions}>
                                <TouchableOpacity 
                                    style={styles.photoActionButton}
                                    onPress={uploadImg}
                                    disabled={uploading}
                                >
                                    <Icon name="check" size={20} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.photoActionButton, styles.cancelButton]}
                                    onPress={() => setNewProfilePic('')}
                                    disabled={uploading}
                                >
                                    <Icon name="close" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* INFORMACIÓN PERSONAL */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información personal</Text>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput
                                keyboardType='phone-pad'
                                mode="flat"
                                placeholder="Ingresa tu número"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.tel_alu}
                                style={styles.input}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, tel_alu: value})}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Dirección</Text>
                            <TextInput
                                mode="flat"
                                placeholder="Calle y número"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.dir_alu}
                                style={styles.input}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, dir_alu: value})}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputContainer, styles.inputHalf]}>
                                <Text style={styles.label}>Colonia</Text>
                                <TextInput
                                    mode="flat"
                                    placeholder="Colonia"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    value={infoAlumno?.col_alu}
                                    style={styles.input}
                                    onChangeText={(value) => setInfoAlumno({...infoAlumno, col_alu: value})}
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.inputHalf]}>
                                <Text style={styles.label}>Delegación</Text>
                                <TextInput
                                    mode="flat"
                                    placeholder="Delegación"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    value={infoAlumno?.del_alu}
                                    style={styles.input}
                                    onChangeText={(value) => setInfoAlumno({...infoAlumno, del_alu: value})}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Entidad</Text>
                            <TextInput
                                mode="flat"
                                placeholder="Estado"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.ent_alu}
                                style={styles.input}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, ent_alu: value})}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <TextInput
                                mode="flat"
                                placeholder="correo@ejemplo.com"
                                keyboardType="email-address"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.cor1_alu}
                                style={styles.input}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, cor1_alu: value})}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>CURP</Text>
                            <TextInput
                                mode="flat"
                                placeholder="18 caracteres"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.cur_alu}
                                style={styles.input}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, cur_alu: value})}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={updateInfo}
                            disabled={loadingForm}
                        >
                            <Text style={styles.primaryButtonText}>
                                {loadingForm ? 'Guardando...' : 'Guardar cambios'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* SEGURIDAD */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Seguridad</Text>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => setModalContrasena(true)}
                        >
                            <View style={styles.menuItemIcon}>
                                <Icon name="lock-outline" size={24} color="#000" />
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemTitle}>Contraseña</Text>
                                <Text style={styles.menuItemSubtitle}>Cambiar contraseña de acceso</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* DOMICILIACIÓN */}
                    <AddDomiciliation
                        domiciliation={domiciliation}
                        updateDomiciliation={getDomiciliation}
                    />

                    {/* PDF */}
                    <RenderPdf
                        title="Solicitud de Inscripción"
                        patterScrollEnabled={setScrollEnabled}
                        pdfUrl={`https://plataforma.ahjende.com/solicitud_inscripcion.php?id_alu_ram=${data_alumno?.id_alu_ram}`}
                        patterStyle={{ marginHorizontal: 16, marginVertical: 20 }}
                    />
                </ScrollView>
                
                {/* MODAL CONTRASEÑA */}
                <Modal visible={modalContrasena} onDismiss={()=>setModalContrasena(false)} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Cambiar contraseña</Text>
                    <TextInput
                        secureTextEntry={true}
                        mode="flat"
                        label="Contraseña actual"
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        value={infoContra.ante_con}
                        style={styles.modalInput}
                        onChangeText={(value) => setInfoContra({...infoContra, ante_con: value})}
                    />
                    <TextInput
                        secureTextEntry={true}
                        mode="flat"
                        label="Nueva contraseña"
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        value={infoContra.nuev_con}
                        style={styles.modalInput}
                        onChangeText={(value) => setInfoContra({...infoContra, nuev_con: value})}
                    />
                    <TextInput
                        secureTextEntry={true}
                        mode="flat"
                        label="Confirmar contraseña"
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        value={infoContra.conf_con}
                        style={styles.modalInput}
                        onChangeText={(value) => setInfoContra({...infoContra, conf_con: value})}
                    />
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={cambiarContrasena}
                        disabled={loadingActuCont}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loadingActuCont ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => setModalContrasena(false)}
                        disabled={loadingActuCont}
                    >
                        <Text style={styles.secondaryButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </Modal>
                <ModalMessages visible={visible} typeMsgModal={typeMsgModal} modalText={modalText} onDismiss={()=>setVisible(false)}/>
            </Portal>
        </Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '600',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    photoActions: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    photoActionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    inputHalf: {
        flex: 1,
        marginBottom: 0,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        fontSize: 16,
        height: 52,
        paddingHorizontal: 16,
    },
    primaryButton: {
        backgroundColor: '#000',
        height: 52,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#FFF',
        height: 52,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    secondaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    modal: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 24,
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginBottom: 16,
        height: 52,
        paddingHorizontal: 16,
    },
});