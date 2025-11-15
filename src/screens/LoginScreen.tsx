import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Text, View, TextInput, Platform, KeyboardAvoidingView, Keyboard, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, ImageBackground, Image, ScrollView } from 'react-native';
import { useForm } from '../hooks/useForm';
import { StackScreenProps } from '@react-navigation/stack';
import { AlertMessage } from '../components/AlertMessage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
            <View style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ESPACIO SUPERIOR */}
                        <View style={styles.artSpace} />

                        {/* LOGO */}
                        <View style={styles.logoContainer}>
                            <Image 
                                source={{ uri: 'https://plataforma.ahjende.com/img/logoLoginEslogan.png' }}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        {/* FORM CARD */}
                        <View style={styles.formCard}>
                            <View style={styles.formHeader}>
                                <Text style={styles.welcomeText}>Bienvenido</Text>
                                <Text style={styles.subtitleText}>Ingresa a tu plataforma educativa</Text>
                            </View>

                            {/* EMAIL INPUT */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Correo electrónico</Text>
                                <View style={styles.inputWrapper}>
                                    <Icon name="email-outline" size={20} color="#000" style={styles.inputIcon} />
                                    <TextInput 
                                        placeholder="nombre@ejemplo.com"
                                        placeholderTextColor="rgba(0,0,0,0.5)"
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
                                <View style={styles.inputWrapper}>
                                    <Icon name="lock-outline" size={20} color="#000" style={styles.inputIcon} />
                                    <TextInput 
                                        placeholder="Ingrese su contraseña"
                                        placeholderTextColor="rgba(0,0,0,0.5)"
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
                                    >
                                        <Icon 
                                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                            size={20} 
                                            color="#000" 
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
                                        <Icon name="arrow-right" size={20} color="#FFF" style={styles.arrowIcon} />
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* TEXTO OLVIDASTE ACCESOS */}
                            <Text style={styles.forgotText}>
                                Si olvidaste tus accesos solicítalos a tu Centro
                            </Text>
                        </View>

                        {/* FOOTER */}
                        <Text style={styles.footerText}>
                            Expertos en educación digital
                        </Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
            {componentMsg}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
    },
    artSpace: {
        height: Platform.OS === 'ios' ? 280 : 240,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 240,
        height: 100,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 24,
        padding: 28,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    formHeader: {
        marginBottom: 28,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: '800',
        color: '#000',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        paddingHorizontal: 14,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#000',
        fontSize: 15,
        paddingVertical: 14,
        fontWeight: '500',
    },
    eyeButton: {
        padding: 8,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    arrowIcon: {
        marginLeft: 10,
    },
    forgotText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginTop: 16,
        fontWeight: '500',
    },
    footerText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.95)',
        fontSize: 12,
        marginBottom: 30,
        fontWeight: '600',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});