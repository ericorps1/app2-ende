import React, { useState } from 'react'
import WebView from 'react-native-webview';
import { View, StyleSheet, useWindowDimensions, Text, ScrollView, TouchableOpacity } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { HTMLSource } from 'react-native-render-html';
import { BackButtonNavigation } from './BackButtonNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatAlumno } from './ChatAlumno';
import { fnDownloadFile } from '../hooks/useDownloads';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';

interface PropsWebViewFullScreen {
    route: {
        params: {
            url: string|null;
            title: string;
            htmlText: HTMLSource;
            downloadFile: boolean;
            viewMiniChat?: boolean;
            isYouTube?: boolean;
            videoId?: string;
        }
    },
    navigation: any
}

export const WebViewFullScreen = ({ route, navigation }:PropsWebViewFullScreen) => {
    const {url, title, htmlText, downloadFile, viewMiniChat, isYouTube, videoId} = route.params;
    const { width } = useWindowDimensions();
    const [download, setDownload] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <BackButtonNavigation onPressBack={() => navigation.pop()} title={title}/>
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* ========== YOUTUBE VIDEO ========== */}
                {isYouTube && videoId && (
                    <>
                        <View style={styles.youtubeContainer}>
                            <YoutubePlayer
                                height={220}
                                videoId={videoId}
                                play={false}
                            />
                        </View>
                        
                        {/* DESCRIPCIÓN DEBAJO DEL VIDEO */}
                        {htmlText && htmlText.html && (
                            <View style={styles.cardContainer}>
                                <RenderHtml
                                    contentWidth={width - 64}
                                    source={htmlText}
                                />
                            </View>
                        )}
                    </>
                )}

                {/* ========== HTML CONTENT (WIKIS / NO-YOUTUBE) ========== */}
                {!isYouTube && htmlText && htmlText.html && (
                    <View style={styles.cardContainer}>
                        <RenderHtml
                            contentWidth={width - 64}
                            source={htmlText}
                        />
                    </View>
                )}

                {/* ========== PREVIEW WEBVIEW (URLs que no son YouTube ni archivos) ========== */}
                {url && !downloadFile && !isYouTube && (
                    <View style={styles.cardContainer}>
                        <WebView
                            source={{uri: url.trim()}}
                            style={styles.webview}
                        />
                    </View>
                )}

                {/* ========== DOWNLOAD BUTTON ========== */}
                {url && downloadFile && (
                    <View style={styles.downloadContainer}>
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => fnDownloadFile(url)}
                            activeOpacity={0.7}
                        >
                            <Icon name="download" size={22} color="#FFF" />
                            <Text style={styles.downloadText}>Descargar archivo</Text>
                        </TouchableOpacity>
                        
                        {/* PREVIEW OPCIONAL DESPUÉS DE DESCARGAR */}
                        {download && (
                            <View style={[styles.cardContainer, {marginTop: 16}]}>
                                <WebView
                                    source={{uri: url}}
                                    style={styles.webview}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ========== MINI CHAT ========== */}
            {viewMiniChat && <ChatAlumno/>}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    
    // ===== YOUTUBE =====
    youtubeContainer: {
        backgroundColor: '#000',
        width: '100%',
        marginBottom: 0,
    },
    
    // ===== CARDS GENERALES =====
    cardContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    // ===== WEBVIEW =====
    webview: {
        width: '100%',
        height: 400,
        borderRadius: 8,
    },
    
    // ===== DOWNLOAD =====
    downloadContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    downloadButton: {
        flexDirection: 'row',
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    downloadText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});