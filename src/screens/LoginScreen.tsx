import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Text, View, TextInput, Platform, KeyboardAvoidingView, Keyboard, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, Image, ScrollView, Linking, Animated, Dimensions } from 'react-native';
import { useForm } from '../hooks/useForm';
import { StackScreenProps } from '@react-navigation/stack';
import { AlertMessage } from '../components/AlertMessage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

interface Props extends StackScreenProps<any, any> {}

const { width, height } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: Props) => {
    const { signIn, errorMessage, removeError } = useContext(AuthContext);
    const { email, password, onChange } = useForm({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [componentMsg, setComponentMsg] = useState(<></>);
    const [showPassword, setShowPassword] = useState(false);
    
    // Animaciones
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideUpAnim] = useState(new Animated.Value(80));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [logoFloat] = useState(new Animated.Value(0));
    
    useEffect(() => {
        // Animación de entrada elegante
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
            }),
        ]).start();

        // Animación flotante del logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(logoFloat, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(logoFloat, {
                    toValue: 0,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if(errorMessage.length === 0) return;
        setComponentMsg(
            AlertMessage('Error en los datos', errorMessage, 'error', () => {
                removeError();
                setComponentMsg(<></>);
            })
        );
    }, [errorMessage]);

    const onLogin = async () => {
        const emailRegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        
        if(!emailRegExp.test(email)){
            setComponentMsg(
                AlertMessage('Correo electrónico', 'Ingrese un correo electrónico válido.', 'error', () => {
                    setComponentMsg(<></>)
                })
            );
            return;
        }
        
        if(password.trim().length < 4){
            setComponentMsg(
                AlertMessage('Contraseña', 'La contraseña debe contener al menos 4 caracteres.', 'error', () => {
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

    const floatY = logoFloat.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10]
    });

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
            <LinearGradient
                colors={['#FFFFFF', '#F8F9FA', '#F1F3F5']}
                style={styles.container}
            >
                {/* DECORACIÓN MINIMALISTA */}
                <View style={styles.circleDecor1} />
                <View style={styles.circleDecor2} />
                <View style={styles.squareDecor} />
                
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* LOGO CON ANIMACIÓN FLOTANTE */}
                        <Animated.View 
                            style={[
                                styles.logoContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { scale: scaleAnim },
                                        { translateY: floatY }
                                    ]
                                }
                            ]}
                        >
                            <View style={styles.logoWrapper}>
                                <Image 
                                    source={{ uri: 'https://plataforma.ahjende.com/img/logoLoginEslogan.png' }}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                        </Animated.View>

                        {/* FORM CARD CON ANIMACIÓN */}
                        <Animated.View 
                            style={[
                                styles.formCardWrapper,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideUpAnim }]
                                }
                            ]}
                        >
                            <View style={styles.formCard}>
                                <View style={styles.formHeader}>
                                    <Text style={styles.welcomeText}>Bienvenido</Text>
                                    <Text style={styles.subtitleText}>Ingresa a tu plataforma educativa</Text>
                                </View>

                                {/* EMAIL INPUT */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Correo electrónico</Text>
                                    <View style={[styles.inputWrapper, email.length > 0 && styles.inputWrapperFocused]}>
                                        <Icon name="email-outline" size={22} color="#666" style={styles.inputIcon} />
                                        <TextInput 
                                            placeholder="nombre@ejemplo.com"
                                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
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
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Contraseña</Text>
                                    <View style={[styles.inputWrapper, password.length > 0 && styles.inputWrapperFocused]}>
                                        <Icon name="lock-outline" size={22} color="#666" style={styles.inputIcon} />
                                        <TextInput 
                                            placeholder="Ingrese su contraseña"
                                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
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
                                                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                                size={22} 
                                                color="#666" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* LOGIN BUTTON */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={onLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size={22} color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>Iniciar sesión</Text>
                                            <Icon name="arrow-right" size={22} color="#FFF" style={styles.arrowIcon} />
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* TEXTO OLVIDASTE ACCESOS */}
                                <Text style={styles.forgotText}>
                                    Si olvidaste tus accesos solicítalos a tu Centro
                                </Text>
                            </View>
                        </Animated.View>

                        {/* FOOTER */}
                        <Animated.View 
                            style={[
                                styles.footerContainer,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <Text style={styles.footerText}>
                                Expertos en educación digital
                            </Text>
                            <TouchableOpacity 
                                onPress={handleLinkPress} 
                                activeOpacity={0.7}
                                style={styles.linkContainer}
                            >
                                <Icon name="web" size={15} color="#000" style={styles.webIcon} />
                                <Text style={styles.linkText}>
                                    www.ahjende.com
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
            {componentMsg}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    circleDecor1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        top: -100,
        right: -100,
    },
    circleDecor2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        bottom: -70,
        left: -70,
    },
    squareDecor: {
        position: 'absolute',
        width: 100,
        height: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.015)',
        top: height * 0.3,
        right: 20,
        transform: [{ rotate: '45deg' }],
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoWrapper: {
        backgroundColor: '#000000',
        paddingHorizontal: 38,
        paddingVertical: 28,
        borderRadius: 26,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    logo: {
        width: 240,
        height: 100,
    },
    formCardWrapper: {
        marginBottom: 30,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.12,
        shadowRadius: 28,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    formHeader: {
        marginBottom: 30,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 34,
        fontWeight: '900',
        color: '#000',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitleText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    inputContainer: {
        marginBottom: 22,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginBottom: 10,
        letterSpacing: 0.3,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        paddingHorizontal: 18,
        height: 58,
    },
    inputWrapperFocused: {
        borderColor: '#000',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    inputIcon: {
        marginRight: 14,
    },
    input: {
        flex: 1,
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 8,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 18,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 14,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    arrowIcon: {
        marginLeft: 10,
    },
    forgotText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 13,
        marginTop: 22,
        fontWeight: '500',
        lineHeight: 19,
    },
    footerContainer: {
        alignItems: 'center',
        gap: 14,
    },
    footerText: {
        textAlign: 'center',
        color: '#333',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    webIcon: {
        marginRight: 8,
    },
    linkText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
});