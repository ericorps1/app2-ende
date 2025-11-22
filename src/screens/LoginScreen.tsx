import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Text, View, TextInput, Platform, KeyboardAvoidingView, Keyboard, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, Image, ScrollView, Linking, Modal, Animated, Easing } from 'react-native';
import { useForm } from '../hooks/useForm';
import { StackScreenProps } from '@react-navigation/stack';
import { AlertMessage } from '../components/AlertMessage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';

interface Props extends StackScreenProps<any, any> {}

export const LoginScreen = ({ navigation }: Props) => {
    const { signIn, errorMessage, removeError } = useContext(AuthContext);
    const { email, password, onChange } = useForm({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [componentMsg, setComponentMsg] = useState(<></>);
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoAnim = useRef(new Animated.Value(-50)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Delay de 1 segundo antes de empezar todo
        Animated.sequence([
            // 0. Espera inicial
            Animated.delay(1000),
            // 1. Fade in de la imagen de fondo
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1400,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            // 2. Delay entre animaciones
            Animated.delay(400),
            // 3. Logo baja y aparece
            Animated.parallel([
                Animated.timing(logoAnim, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                })
            ])
        ]).start();
    }, []);

    useEffect(() => {
        if(errorMessage.length === 0) return;
        setComponentMsg(
            AlertMessage('Error de autenticación', errorMessage, 'error', () => {
                removeError();
                setComponentMsg(<></>);
            })
        );
    }, [errorMessage]);

    const onLogin = async () => {
        const emailRegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        
        if(!emailRegExp.test(email)){
            setComponentMsg(
                AlertMessage('Correo inválido', 'Por favor ingresa un correo electrónico válido.', 'error', () => {
                    setComponentMsg(<></>)
                })
            );
            return;
        }
        
        if(password.trim().length < 4){
            setComponentMsg(
                AlertMessage('Contraseña requerida', 'La contraseña debe tener al menos 4 caracteres.', 'error', () => {
                    setComponentMsg(<></>)
                })
            );
            return;
        }
        
        Keyboard.dismiss();
        setLoading(true);
        await signIn({ correo: email, password });
        setLoading(false);
    }

    const handleLinkPress = async () => {
        const url = 'https://ahjende.com/';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        }
    }

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
            <View style={styles.container}>
                {/* TRIÁNGULO NEGRO INFERIOR - SOLO PERÍMETRO */}
                <Svg height="120" width="120" style={styles.triangleBottomSvg}>
                    <Path
                        d="M 60 10 L 110 100 L 10 100 Z"
                        stroke="rgba(0, 0, 0, 0.15)"
                        strokeWidth="2"
                        fill="transparent"
                    />
                </Svg>
                
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        {/* IMAGEN DE FONDO CON FADE IN */}
                        <Animated.View style={[
                            styles.backgroundImageContainer,
                            { opacity: fadeAnim }
                        ]}>
                            <Image 
                                source={{ uri: 'https://plataforma.ahjende.com/img/creacionAdan.png' }}
                                style={styles.backgroundImage}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        {/* LOGO CON FADE IN DOWN */}
                        <Animated.View style={[
                            styles.logoContainer,
                            {
                                opacity: logoOpacity,
                                transform: [{ translateY: logoAnim }]
                            }
                        ]}>
                            <Image 
                                source={{ uri: 'https://plataforma.ahjende.com/img/logoAzulado_1.png' }}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        {/* FORM CARD */}
                        <View style={styles.formCard}>
                            {/* HEADER */}
                            <View style={styles.formHeader}>
                                <Text style={styles.welcomeText}>Bienvenido, Líder</Text>
                                <View style={styles.accentLine} />
                                <Text style={styles.subtitleText}>Accede a tu plataforma educativa</Text>
                            </View>

                            {/* EMAIL INPUT */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Correo electrónico</Text>
                                <View style={[styles.inputWrapper, email.length > 0 && styles.inputWrapperFocused]}>
                                    <Icon name="email-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput 
                                        placeholder="tu@correo.com"
                                        placeholderTextColor="rgba(153, 153, 153, 0.5)"
                                        keyboardType="email-address"
                                        style={styles.input}
                                        onChangeText={(value) => onChange(value, 'email')}
                                        value={email}
                                        onSubmitEditing={onLogin}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            {/* PASSWORD INPUT */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Contraseña</Text>
                                <View style={[styles.inputWrapper, password.length > 0 && styles.inputWrapperFocused]}>
                                    <Icon name="lock-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput 
                                        placeholder="Ingresa tu contraseña"
                                        placeholderTextColor="rgba(153, 153, 153, 0.5)"
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                        onChangeText={(value) => onChange(value, 'password')}
                                        value={password}
                                        onSubmitEditing={onLogin}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                        activeOpacity={0.7}
                                    >
                                        <Icon 
                                            name={showPassword ? "eye-off" : "eye"} 
                                            size={20} 
                                            color="#999" 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* FORGOT PASSWORD BUTTON */}
                            <TouchableOpacity 
                                style={styles.forgotButton}
                                activeOpacity={0.7}
                                onPress={() => setShowModal(true)}
                            >
                                <Text style={styles.forgotText}>¿Olvidaste tus accesos?</Text>
                            </TouchableOpacity>

                            {/* LOGIN BUTTON - NEGRO */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={onLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                                        <Icon name="arrow-right" size={20} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* FOOTER */}
                        <View style={styles.footer}>
                            <View style={styles.footerDivider} />
                            <Text style={styles.footerTitle}>Expertos en educación digital</Text>
                            <TouchableOpacity 
                                onPress={handleLinkPress} 
                                activeOpacity={0.7}
                                style={styles.websiteButton}
                            >
                                <Icon name="web" size={16} color="#00BFA5" />
                                <Text style={styles.websiteText}>www.ahjende.com</Text>
                                <Icon name="open-in-new" size={14} color="#00BFA5" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* MODAL PARA ACCESOS OLVIDADOS */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => setShowModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Icon name="information-outline" size={48} color="#00BFA5" />
                            </View>
                            
                            <Text style={styles.modalTitle}>Recuperar accesos</Text>
                            <Text style={styles.modalMessage}>
                                Para recuperar tus credenciales de acceso, por favor contacta con tu Centro Educativo.
                            </Text>
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalButtonClose}
                                    activeOpacity={0.8}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.modalButtonTextClose}>Entendido</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
            {componentMsg}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // TRIÁNGULO SVG INFERIOR
    triangleBottomSvg: {
        position: 'absolute',
        bottom: 30,
        left: '50%',
        marginLeft: -60,
        zIndex: 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 40,
    },
    // IMAGEN DE FONDO
    backgroundImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 0,
    },
    backgroundImage: {
        width: 400,
        height: 200,
        marginTop: Platform.OS === 'ios' ? 80 : 60,
    },
    // LOGO DORADO LIMPIO
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
        zIndex: 1,
    },
    logo: {
        width: 280,
        height: 120,
    },
    // FORM CARD BLANCO
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    formHeader: {
        marginBottom: 32,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    accentLine: {
        width: 60,
        height: 3,
        backgroundColor: '#00BFA5',
        borderRadius: 2,
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
        marginLeft: 4,
        letterSpacing: 0.3,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        paddingHorizontal: 16,
        height: 54,
    },
    inputWrapperFocused: {
        backgroundColor: '#FFFFFF',
        borderColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#1a1a1a',
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 8,
        marginLeft: 8,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: 4,
    },
    forgotText: {
        fontSize: 13,
        color: '#00BFA5',
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    // BOTÓN LOGIN NEGRO
    loginButton: {
        backgroundColor: '#000000',
        borderRadius: 14,
        flexDirection: 'row',
        paddingVertical: 17,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    // FOOTER
    footer: {
        alignItems: 'center',
        marginTop: 40,
        gap: 16,
    },
    footerDivider: {
        width: 60,
        height: 3,
        backgroundColor: 'rgba(0, 191, 165, 0.3)',
        borderRadius: 2,
        marginBottom: 4,
    },
    footerTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        letterSpacing: 0.5,
    },
    websiteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 191, 165, 0.06)',
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 165, 0.2)',
    },
    websiteText: {
        color: '#00BFA5',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    // MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 165, 0.2)',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(0, 191, 165, 0.1)',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    modalMessage: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 28,
    },
    modalButtons: {
        gap: 12,
    },
    modalButtonClose: {
        backgroundColor: '#000000',
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    modalButtonTextClose: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});