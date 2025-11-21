import React, { useState } from 'react'
import WebView from 'react-native-webview';
import { View, StyleSheet, useWindowDimensions, Text, ScrollView, TouchableOpacity } from 'react-native';
import { HTMLSource } from 'react-native-render-html';
import { BackButtonNavigation } from './BackButtonNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatAlumno } from './ChatAlumno';
import { fnDownloadFile } from '../hooks/useDownloads';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { HtmlToJsx } from './HtmlToJsx';

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
                {/* YOUTUBE VIDEO */}
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
                            <View style={styles.descriptionContainer}>
                                <HtmlToJsx strHtml={htmlText.html} />
                            </View>
                        )}
                    </>
                )}

                {/* HTML CONTENT (para recursos que NO son YouTube - WIKIS) */}
                {!isYouTube && htmlText && htmlText.html && (
                    <View style={styles.htmlContainer}>
                        <HtmlToJsx strHtml={htmlText.html} />
                    </View>
                )}

                {/* PREVIEW (para otros URLs que no sean YouTube) */}
                {url && !downloadFile && !isYouTube && (
                    <View style={styles.previewContainer}>
                        <WebView
                            source={{uri: url.trim()}}
                            style={styles.webview}
                        />
                    </View>
                )}

                {/* DOWNLOAD BUTTON */}
                {url && downloadFile && (
                    <View style={styles.downloadContainer}>
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => fnDownloadFile(url)}
                            activeOpacity={0.7}
                        >
                            <Icon name="download" size={20} color="#FFF" />
                            <Text style={styles.downloadText}>Descargar archivo</Text>
                        </TouchableOpacity>
                        
                        {download && (
                            <View style={styles.previewContainer}>
                                <WebView
                                    source={{uri: url}}
                                    style={styles.webview}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

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
    youtubeContainer: {
        backgroundColor: '#000',
        width: '100%',
    },
    descriptionContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    htmlContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    previewContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    webview: {
        width: '100%',
        height: 400,
    },
    downloadContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    downloadButton: {
        flexDirection: 'row',
        backgroundColor: '#000',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    downloadText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
});