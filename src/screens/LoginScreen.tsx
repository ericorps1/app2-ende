import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Text, View, TextInput, Platform, KeyboardAvoidingView, Keyboard, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Background } from '../components/Background';
import { WhiteLogo } from '../components/WhiteLogo';
import { loginStyles } from '../theme/loginTheme';
import { useForm } from '../hooks/useForm';
import { StackScreenProps } from '@react-navigation/stack';
import { colors, platformTheme } from '../theme/platformTheme';
import { AlertMessage } from '../components/AlertMessage';


interface Props extends StackScreenProps<any, any> {}

export const LoginScreen = ({ navigation }: Props) => {
    
    const { signIn, errorMessage, removeError } = useContext( AuthContext );

    const { email, password, onChange } = useForm({
       email: '',
       password: '' 
    });

    const [loading, setLoading] = useState(false);
    const [componentMsg, setComponentMsg] = useState(<></>);
    
    useEffect(() => {
        if( errorMessage.length === 0 ) return;
        setComponentMsg(AlertMessage('Error en los datos', errorMessage, 'error', () => {removeError();setComponentMsg(<></>)}));
        // Alert.alert( 'Error en los datos', errorMessage,[{
        //     text: 'Reintentar',
        //     onPress: removeError
        // }]);

    }, [ errorMessage ])

    // const viewErrorMessage = (title:string, message:string, msgType:'error' | 'success' | 'danger', eventOK= () => false ) => {
    //     return (
    //         <AlertMessage title={title} message={message} msgType={msgType} eventOk={eventOK}/>
    //     )
    // }


    const onLogin = async () => {
        const emailRegExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if(!emailRegExp.test(email)){
            setComponentMsg(AlertMessage('Correo electrónico', 'Ingrese un correo electrónico válido.', 'error', () => {setComponentMsg(<></>)}));
            return;
        }else if(password.trim().length<3){
            setComponentMsg(AlertMessage('Contraseña', 'La contraseña debe contener al menos 4 caracteres.', 'error', () => {setComponentMsg(<></>)}));
            return;
        }
        Keyboard.dismiss();
        setLoading(true);
        await signIn({ correo: email, password });
        setLoading(false);
    }

    return (
        <>
            {/* Background */}
            <Background/>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={ (Platform.OS === 'ios') ? 'padding': 'height' }
            >

                <View style={ loginStyles.formContainer }>                
                    {/* Keyboard avoid view */}
                    <WhiteLogo />
                    <Text style={ loginStyles.label }>Escuela de negocios y desarrollo empresarial</Text>
                    <Text style={ loginStyles.title }>Plataforma ENDE</Text>

                    

                    <Text style={ loginStyles.label }>Correo electrónico:</Text>
                    <TextInput 
                        placeholder="Ingrese su correo:"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="email-address"
                        underlineColorAndroid='white'
                        style={[ 
                            loginStyles.inputField,
                            ( Platform.OS === 'ios' ) ? loginStyles.inputFieldIOS : loginStyles.inputFieldANDROID
                        ]}
                        selectionColor={colors.darkSilver}

                        onChangeText={ (value) => onChange(value, 'email') }
                        value={ email }
                        onSubmitEditing={ onLogin }


                        autoCapitalize="none"
                        autoCorrect={ false }
                    />


                    <Text style={ loginStyles.label }>Contraseña:</Text>
                    <TextInput 
                        placeholder="*********"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        underlineColorAndroid="white"
                        secureTextEntry
                        style={[ 
                            loginStyles.inputField,
                            ( Platform.OS === 'ios' ) ? loginStyles.inputFieldIOS : loginStyles.inputFieldANDROID
                        ]}
                        selectionColor={colors.darkSilver}

                        onChangeText={ (value) => onChange(value, 'password') }
                        value={ password }
                        onSubmitEditing={ onLogin }

                        autoCapitalize="none"
                        autoCorrect={ false }
                    />


                    {/* Boton login */}
                    <View style={ loginStyles.buttonContainer }>
                        <TouchableOpacity
                            activeOpacity={ 0.2 }
                            style={{ ...loginStyles.button, flexDirection: 'row' }}
                            onPress={ onLogin }
                            disabled={ loading }
                        >
                            {(loading) && <ActivityIndicator size={20} color="white"/>}
                            <Text 
                                style={ {...loginStyles.buttonText} }
                            >
                                {(loading) ? 'Iniciando...' : 'Iniciar sesión'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    
                </View>
                
            </KeyboardAvoidingView>
            {componentMsg}
        </>
    )
}
