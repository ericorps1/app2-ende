import React, {useContext, useState, useEffect} from 'react'
import { View, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
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
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const Cuenta = () => {
    const { theme, toggleTheme, colors: themeColors } = useTheme();
    const { data_alumno, checkToken } = useContext( AuthContext );
    const [infoAlumno, setInfoAlumno] = useState<DataProfileAlumno|any>([]);
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    useEffect(() => {
        getDataProfile();
        getDomiciliation();
    }, [])

    const getStatusStyle = (status: string | undefined) => {
        if (!status) return { color: '#999', dotColor: '#999' };
        
        const statusUpper = status.toUpperCase();
        
        if (statusUpper === 'ACTIVO' || statusUpper === 'REINGRESO') {
            return { color: '#34C759', dotColor: '#34C759' };
        }
        
        if (statusUpper === 'BAJA' || statusUpper === 'NP') {
            return { color: '#FF6B6B', dotColor: '#FF6B6B' };
        }
        
        return { color: '#999', dotColor: '#999' };
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            getDataProfile(),
            getDomiciliation()
        ]);
        setRefreshing(false);
    }

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
            setLoadingAccount(false);
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

    const statusStyle = getStatusStyle(data_alumno?.estatus_general);

    return (
        (loadingAccount) 
        ? <LoadingScreen/>
        : <Provider theme={DefaultTheme}>
            <Portal>
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    scrollEnabled={scrollEnabled}
                    style={[styles.container, { backgroundColor: themeColors.background }]}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={themeColors.textPrimary}
                            colors={[themeColors.textPrimary]}
                        />
                    }
                >
                    <View style={[styles.heroSection, { backgroundColor: themeColors.backgroundCard, borderBottomColor: themeColors.borderGray }]}>
                        <View style={styles.heroContent}>
                            <TouchableOpacity onPress={() => getPhoto('img')} activeOpacity={0.8}>
                                { (data_alumno?.fot_alu || newProfilePic!=='') 
                                    ? (
                                        <Image 
                                            source={{ uri: (newProfilePic==='') ? 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu : newProfilePic}}
                                            style={styles.heroAvatar}
                                        />
                                    )
                                    : (
                                        <View style={[styles.heroAvatar, { backgroundColor: themeColors.textPrimary }]}>
                                            <Text style={[styles.heroAvatarText, { color: themeColors.backgroundCard }]}>
                                                {FormatNameAvatar(data_alumno?.nom_alu)}
                                            </Text>
                                        </View>
                                    )
                                }
                                <View style={[styles.cameraIconBadge, { backgroundColor: themeColors.textPrimary, borderColor: themeColors.backgroundCard }]}>
                                    <Icon name="camera" size={16} color={themeColors.backgroundCard} />
                                </View>
                            </TouchableOpacity>
                            
                            <Text style={[styles.heroName, { color: themeColors.textPrimary }]}>{data_alumno?.nom_alu}</Text>
                            
                            <View style={[styles.statusBadge, { backgroundColor: themeColors.backgroundGray }]}>
                                <View style={[styles.statusDot, { backgroundColor: statusStyle.dotColor }]} />
                                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                                    {data_alumno?.estatus_general}
                                </Text>
                            </View>

                            <View style={styles.plantelBadge}>
                                <Icon name="map-marker-outline" size={14} color={themeColors.textSecondary} />
                                <Text style={[styles.plantelText, { color: themeColors.textSecondary }]}>
                                    {data_alumno?.nom_pla}
                                </Text>
                            </View>
                        </View>
                        
                        {newProfilePic !== '' && (
                            <View style={styles.photoActions}>
                                <TouchableOpacity 
                                    style={styles.photoActionButton}
                                    onPress={uploadImg}
                                    disabled={uploading}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="check" size={18} color="#34C759" />
                                    <Text style={styles.photoActionText}>Guardar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.photoActionButton, styles.cancelButton, { backgroundColor: themeColors.backgroundGray }]}
                                    onPress={() => setNewProfilePic('')}
                                    disabled={uploading}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="close" size={18} color={themeColors.textSecondary} />
                                    <Text style={[styles.photoActionText, styles.cancelText, { color: themeColors.textSecondary }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={[styles.section, { backgroundColor: themeColors.backgroundCard }]}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Información personal</Text>
                        
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Teléfono</Text>
                            <TextInput
                                keyboardType='phone-pad'
                                mode="flat"
                                placeholder="Ingresa tu número"
                                placeholderTextColor={themeColors.textTertiary}
                                textColor={themeColors.textPrimary}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.tel_alu}
                                style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                theme={{
                                    colors: {
                                        text: themeColors.textPrimary,
                                        placeholder: themeColors.textTertiary,
                                    }
                                }}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, tel_alu: value})}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Dirección</Text>
                            <TextInput
                                mode="flat"
                                placeholder="Calle y número"
                                placeholderTextColor={themeColors.textTertiary}
                                textColor={themeColors.textPrimary}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.dir_alu}
                                style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                theme={{
                                    colors: {
                                        text: themeColors.textPrimary,
                                        placeholder: themeColors.textTertiary,
                                    }
                                }}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, dir_alu: value})}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputContainer, styles.inputHalf]}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Colonia</Text>
                                <TextInput
                                    mode="flat"
                                    placeholder="Colonia"
                                    placeholderTextColor={themeColors.textTertiary}
                                    textColor={themeColors.textPrimary}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    value={infoAlumno?.col_alu}
                                    style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                    theme={{
                                        colors: {
                                            text: themeColors.textPrimary,
                                            placeholder: themeColors.textTertiary,
                                        }
                                    }}
                                    onChangeText={(value) => setInfoAlumno({...infoAlumno, col_alu: value})}
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.inputHalf]}>
                                <Text style={[styles.label, { color: themeColors.textSecondary }]}>Delegación</Text>
                                <TextInput
                                    mode="flat"
                                    placeholder="Delegación"
                                    placeholderTextColor={themeColors.textTertiary}
                                    textColor={themeColors.textPrimary}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    value={infoAlumno?.del_alu}
                                    style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                    theme={{
                                        colors: {
                                            text: themeColors.textPrimary,
                                            placeholder: themeColors.textTertiary,
                                        }
                                    }}
                                    onChangeText={(value) => setInfoAlumno({...infoAlumno, del_alu: value})}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Entidad</Text>
                            <TextInput
                                mode="flat"
                                placeholder="Estado"
                                placeholderTextColor={themeColors.textTertiary}
                                textColor={themeColors.textPrimary}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.ent_alu}
                                style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                theme={{
                                    colors: {
                                        text: themeColors.textPrimary,
                                        placeholder: themeColors.textTertiary,
                                    }
                                }}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, ent_alu: value})}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Correo electrónico</Text>
                            <TextInput
                                mode="flat"
                                placeholder="correo@ejemplo.com"
                                placeholderTextColor={themeColors.textTertiary}
                                textColor={themeColors.textPrimary}
                                keyboardType="email-address"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.cor1_alu}
                                style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                theme={{
                                    colors: {
                                        text: themeColors.textPrimary,
                                        placeholder: themeColors.textTertiary,
                                    }
                                }}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, cor1_alu: value})}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>CURP</Text>
                            <TextInput
                                mode="flat"
                                placeholder="18 caracteres"
                                placeholderTextColor={themeColors.textTertiary}
                                textColor={themeColors.textPrimary}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                value={infoAlumno?.cur_alu}
                                style={[styles.input, { backgroundColor: themeColors.backgroundGray }]}
                                theme={{
                                    colors: {
                                        text: themeColors.textPrimary,
                                        placeholder: themeColors.textTertiary,
                                    }
                                }}
                                onChangeText={(value) => setInfoAlumno({...infoAlumno, cur_alu: value})}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.primaryButton, { backgroundColor: themeColors.textPrimary }]}
                            onPress={updateInfo}
                            disabled={loadingForm}
                            activeOpacity={0.7}
                        >
                            {loadingForm && <Icon name="loading" size={18} color={themeColors.backgroundCard} style={styles.buttonIcon} />}
                            <Text style={[styles.primaryButtonText, { color: themeColors.backgroundCard }]}>
                                {loadingForm ? 'Guardando cambios' : 'Guardar cambios'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.section, { backgroundColor: themeColors.backgroundCard }]}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Seguridad</Text>
                        
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => setModalContrasena(true)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuItemIcon, { backgroundColor: themeColors.backgroundGray }]}>
                                <Icon name="lock-outline" size={20} color={themeColors.textPrimary} />
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={[styles.menuItemTitle, { color: themeColors.textPrimary }]}>Contraseña</Text>
                                <Text style={[styles.menuItemSubtitle, { color: themeColors.textSecondary }]}>
                                    Cambiar contraseña de acceso
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={themeColors.borderGray} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuItemIcon, { backgroundColor: themeColors.backgroundGray }]}>
                                <Icon 
                                    name={theme === 'dark' ? 'weather-night' : 'white-balance-sunny'} 
                                    size={20} 
                                    color={themeColors.textPrimary} 
                                />
                            </View>
                            <View style={styles.menuItemContent}>
                                <Text style={[styles.menuItemTitle, { color: themeColors.textPrimary }]}>
                                    Modo oscuro
                                </Text>
                                <Text style={[styles.menuItemSubtitle, { color: themeColors.textSecondary }]}>
                                    {theme === 'dark' ? 'Activado' : 'Desactivado'}
                                </Text>
                            </View>
                            <View style={[
                                styles.switchToggle, 
                                { backgroundColor: theme === 'dark' ? '#00BFA5' : '#E0E0E0' }
                            ]}>
                                <View style={[
                                    styles.switchThumb,
                                    theme === 'dark' && styles.switchThumbActive
                                ]} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <AddDomiciliation
                        domiciliation={domiciliation}
                        updateDomiciliation={getDomiciliation}
                    />

                    <RenderPdf
                        title="Solicitud de Inscripción"
                        patterScrollEnabled={setScrollEnabled}
                        pdfUrl={`https://plataforma.ahjende.com/solicitud_inscripcion.php?id_alu_ram=${data_alumno?.id_alu_ram}`}
                        patterStyle={{ marginHorizontal: 16, marginVertical: 20 }}
                    />
                </ScrollView>
                
                <Modal visible={modalContrasena} onDismiss={()=>setModalContrasena(false)} contentContainerStyle={[styles.modal, { backgroundColor: themeColors.backgroundCard }]}>
                    <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Cambiar contraseña</Text>
                    <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
                        Ingresa tu contraseña actual y elige una nueva
                    </Text>
                    
                    <TextInput
                        secureTextEntry={true}
                        mode="flat"
                        label="Contraseña actual"
                        textColor={themeColors.textPrimary}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        value={infoContra.ante_con}
                        style={[styles.modalInput, { backgroundColor: themeColors.backgroundGray }]}
                        theme={{
                            colors: {
                                text: themeColors.textPrimary,
                                placeholder: themeColors.textTertiary,
                            }
                        }}
                        onChangeText={(value) => setInfoContra({...infoContra, ante_con: value})}
                    />
                    <TextInput
                        secureTextEntry={true}
                        mode="flat"
                        label="Nueva contraseña"
                        textColor={themeColors.textPrimary}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        value={infoContra.nuev_con}
                        style={[styles.modalInput, { backgroundColor: themeColors.backgroundGray }]}
                        theme={{
                            colors: {
                                text: themeColors.textPrimary,
                                placeholder: themeColors.textTertiary,
                            }
                        }}
                        onChangeText={(value) => setInfoContra({...infoContra, nuev_con: value})}
                    />
                    <TextInput
                        secureTextEntry={true}
                        mode="flat"
                        label="Confirmar contraseña"
                        textColor={themeColors.textPrimary}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        value={infoContra.conf_con}
                        style={[styles.modalInput, { backgroundColor: themeColors.backgroundGray }]}
                        theme={{
                            colors: {
                                text: themeColors.textPrimary,
                                placeholder: themeColors.textTertiary,
                            }
                        }}
                        onChangeText={(value) => setInfoContra({...infoContra, conf_con: value})}
                    />
                    <TouchableOpacity 
                        style={[styles.primaryButton, { backgroundColor: themeColors.textPrimary }]}
                        onPress={cambiarContrasena}
                        disabled={loadingActuCont}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.primaryButtonText, { color: themeColors.backgroundCard }]}>
                            {loadingActuCont ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.secondaryButton, { backgroundColor: themeColors.backgroundGray }]}
                        onPress={() => setModalContrasena(false)}
                        disabled={loadingActuCont}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.secondaryButtonText, { color: themeColors.textPrimary }]}>Cancelar</Text>
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
    },
    heroSection: {
        paddingTop: 60,
        paddingBottom: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    heroContent: {
        alignItems: 'center',
        width: '100%',
    },
    heroAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    heroAvatarText: {
        fontSize: 32,
        fontWeight: '700',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 16,
        right: -2,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    heroName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        marginBottom: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    plantelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    plantelText: {
        fontSize: 13,
        fontWeight: '500',
    },
    photoActions: {
        flexDirection: 'row',
        marginTop: 20,
        paddingHorizontal: 20,
        gap: 8,
        width: '100%',
    },
    photoActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 10,
        backgroundColor: '#E8F5E9',
        gap: 6,
    },
    cancelButton: {
    },
    photoActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34C759',
    },
    cancelText: {
    },
    section: {
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    input: {
        borderRadius: 10,
        fontSize: 15,
        height: 48,
        paddingHorizontal: 14,
    },
    primaryButton: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    buttonIcon: {
        marginRight: -4,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 13,
    },
    switchToggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },
    modal: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    modalInput: {
        borderRadius: 10,
        marginBottom: 14,
        height: 48,
        paddingHorizontal: 14,
    },
});