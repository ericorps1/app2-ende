import React, { useState } from 'react'
import WebView from 'react-native-webview';
import { View, StyleSheet, useWindowDimensions, Text, ScrollView, TouchableOpacity, Touchable } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { HTMLSource } from 'react-native-render-html';
import { colors } from '../theme/platformTheme';
import { BackButtonNavigation } from './BackButtonNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatAlumno } from './ChatAlumno';
import { fnDownloadFile } from '../hooks/useDownloads';

interface PropsWebViewFullScreen {
    route: {
        params: {
            url: string|null;
            title: string;
            htmlText: HTMLSource;
            downloadFile: boolean;
            viewMiniChat?: boolean;
        }
    },
    navigation: any
}

export const WebViewFullScreen = ({ route, navigation }:PropsWebViewFullScreen) => {
    const {url, title, htmlText, downloadFile, viewMiniChat} = route.params;
    const { width } = useWindowDimensions();
    const [download, setDownload] = useState(false)

    return (
        <SafeAreaView style={ styles.container }>
            <BackButtonNavigation onPressBack={() => navigation.pop()} title={title}/>
            <ScrollView style={{marginBottom: 50}}>
                <View style={ styles.bodyWevViewFS }>
                    <View style={styles.bodyContentElements}>
                        <RenderHtml
                            contentWidth={width}
                            source={htmlText}
                        />
                    </View>
                    { url && downloadFile===false && //si viene una url y no es un archivo de descarga se monta la previsualizacion
                        <View style={styles.bodyContentElements}>
                            <WebView
                                visible={true}
                                source={{uri: url.trim()}}
                                style={{width: '100%',height: 400}}
                            />
                        </View>
                    }
                    { url && downloadFile===true && //Si es una url y es un archivo de descarga se monta el botón de descarga
                        <View style={styles.bodyContentElements}>
                            <TouchableOpacity
                                style={ styles.btnDownload }
                                onPress={()=>fnDownloadFile(url)}
                            >
                                <Text style={ styles.btnDownloadText }>DESCARGAR</Text>
                            </TouchableOpacity>
                            { download && <WebView
                                    visible={true}
                                    source={{uri: url}}
                                    style={{width: '100%',height: 400}}
                                /> 
                            }
                        </View>
                    }
                </View>
            </ScrollView>
            { viewMiniChat && <ChatAlumno/> }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      paddingTop: 10,
      flex: 1,
      paddingLeft: 20,
    },
    bodyWevViewFS: { 
      flex: 1,
      justifyContent: 'flex-start',
    },
    title: {
      fontSize: 30,
      color: colors.darkBlue
    },
    bodyContentElements: {
        paddingRight: 20,
        paddingVertical: 20,
    },
    btnDownload: {
        backgroundColor: colors.darkBlue,
        padding: 5,
        borderRadius: 10,
    },
    btnDownloadText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18
    }
})