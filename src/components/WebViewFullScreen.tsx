import React, { useState } from 'react'
import WebView from 'react-native-webview';
import { View, StyleSheet, useWindowDimensions, Text, ScrollView, TouchableOpacity } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { HTMLSource } from 'react-native-render-html';
import { BackButtonNavigation } from './BackButtonNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatAlumno } from './ChatAlumno';
import { fnDownloadFile } from '../hooks/useDownloads';
import { useTheme } from '../context/ThemeContext';
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
    const { colors: themeColors } = useTheme();
    const {url, title, htmlText, downloadFile, viewMiniChat, isYouTube, videoId} = route.params;
    const { width } = useWindowDimensions();
    const [downloaded, setDownloaded] = useState(false);

    // 🌓 Detección robusta de dark mode
    const isDarkTheme = (() => {
        const bg = themeColors.background?.toLowerCase() || '';
        const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
        const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
        
        console.log('🌓 WEBVIEW_FULLSCREEN - themeColors.background:', themeColors.background);
        console.log('🌓 WEBVIEW_FULLSCREEN - themeColors.backgroundCard:', themeColors.backgroundCard);
        console.log('🌓 WEBVIEW_FULLSCREEN - themeColors.textPrimary:', themeColors.textPrimary);
        
        const isDark = bg === '#000' || 
                       bg === '#000000' ||
                       bg === '#121212' || 
                       bg === '#1a1a1a' ||
                       cardBg === '#000' ||
                       cardBg === '#000000' ||
                       cardBg === '#121212' ||
                       cardBg === '#1e1e1e' ||
                       cardBg === '#1a1a1a' ||
                       textPrimary === '#fff' ||
                       textPrimary === '#ffffff' ||
                       textPrimary === '#f5f5f5' ||
                       bg.includes('black') ||
                       (bg.startsWith('#') && parseInt(bg.replace('#', ''), 16) < 3355443);
        
        console.log('🌓 WEBVIEW_FULLSCREEN - isDarkTheme resultado:', isDark);
        
        return isDark;
    })();

    // 🎨 Estilos HTML que se adaptan al tema
    const htmlStyles = {
        body: {
            color: themeColors.textPrimary,
        },
        p: {
            color: themeColors.textPrimary,
            marginBottom: 12,
            lineHeight: 22,
        },
        h1: {
            color: themeColors.textPrimary,
            marginBottom: 16,
            fontWeight: '700',
        },
        h2: {
            color: themeColors.textPrimary,
            marginBottom: 14,
            fontWeight: '700',
        },
        h3: {
            color: themeColors.textPrimary,
            marginBottom: 12,
            fontWeight: '600',
        },
        h4: {
            color: themeColors.textPrimary,
            marginBottom: 10,
            fontWeight: '600',
        },
        h5: {
            color: themeColors.textPrimary,
            marginBottom: 8,
            fontWeight: '600',
        },
        h6: {
            color: themeColors.textPrimary,
            marginBottom: 8,
            fontWeight: '600',
        },
        strong: {
            color: themeColors.textPrimary,
            fontWeight: '700',
        },
        b: {
            color: themeColors.textPrimary,
            fontWeight: '700',
        },
        em: {
            color: themeColors.textPrimary,
        },
        i: {
            color: themeColors.textPrimary,
        },
        a: {
            color: isDarkTheme ? '#60a5fa' : '#2196F3',
            textDecorationLine: 'underline',
        },
        ul: {
            color: themeColors.textPrimary,
            marginBottom: 12,
        },
        ol: {
            color: themeColors.textPrimary,
            marginBottom: 12,
        },
        li: {
            color: themeColors.textPrimary,
            marginBottom: 8,
            lineHeight: 22,
        },
        blockquote: {
            color: themeColors.textSecondary,
            borderLeftColor: themeColors.textSecondary,
            borderLeftWidth: 4,
            paddingLeft: 16,
            marginVertical: 12,
            fontStyle: 'italic',
        },
        code: {
            color: isDarkTheme ? '#F8BBD0' : '#E91E63',
            backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontFamily: 'monospace',
        },
        pre: {
            backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray,
            padding: 12,
            borderRadius: 8,
            marginVertical: 12,
        },
        table: {
            color: themeColors.textPrimary,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : themeColors.borderGray,
        },
        th: {
            color: themeColors.textPrimary,
            backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray,
            fontWeight: '700',
        },
        td: {
            color: themeColors.textPrimary,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : themeColors.borderGray,
        },
        hr: {
            backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : themeColors.borderGray,
        },
        span: {
            color: themeColors.textPrimary,
        },
        div: {
            color: themeColors.textPrimary,
        },
    };

    // 🎨 Función para obtener ícono y color según extensión
    const getFileInfo = (url: string) => {
        const fileName = url.split('/').pop() || '';
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        
        console.log('📎 getFileInfo - isDarkTheme:', isDarkTheme);
        console.log('📎 getFileInfo - extension:', extension);
        
        if (isDarkTheme) {
            const fileIconsDark: {[key: string]: {icon: string, color: string, type: string}} = {
                'pdf': { icon: 'file-pdf-box', color: '#D0A8A0', type: 'PDF' },
                'doc': { icon: 'file-word-box', color: '#9DB4C8', type: 'Word' },
                'docx': { icon: 'file-word-box', color: '#9DB4C8', type: 'Word' },
                'xls': { icon: 'file-excel-box', color: '#A8C4A8', type: 'Excel' },
                'xlsx': { icon: 'file-excel-box', color: '#A8C4A8', type: 'Excel' },
                'ppt': { icon: 'file-powerpoint-box', color: '#D4BDA0', type: 'PowerPoint' },
                'pptx': { icon: 'file-powerpoint-box', color: '#D4BDA0', type: 'PowerPoint' },
                'zip': { icon: 'folder-zip', color: '#D4BDA0', type: 'Archivo comprimido' },
                'rar': { icon: 'folder-zip', color: '#D4BDA0', type: 'Archivo comprimido' },
                'jpg': { icon: 'file-image', color: '#C4ADC8', type: 'Imagen' },
                'jpeg': { icon: 'file-image', color: '#C4ADC8', type: 'Imagen' },
                'png': { icon: 'file-image', color: '#C4ADC8', type: 'Imagen' },
                'mp4': { icon: 'file-video', color: '#D0A8A0', type: 'Video' },
                'mp3': { icon: 'file-music', color: '#9DB4C8', type: 'Audio' },
                'txt': { icon: 'file-document', color: '#B0B0B0', type: 'Texto' },
            };
            
            const result = fileIconsDark[extension] || { icon: 'file-document-outline', color: '#888888', type: 'Archivo' };
            console.log('✅ Dark mode file color:', result.color);
            return result;
        } else {
            const fileIconsLight: {[key: string]: {icon: string, color: string, type: string}} = {
                'pdf': { icon: 'file-pdf-box', color: '#D32F2F', type: 'PDF' },
                'doc': { icon: 'file-word-box', color: '#2B579A', type: 'Word' },
                'docx': { icon: 'file-word-box', color: '#2B579A', type: 'Word' },
                'xls': { icon: 'file-excel-box', color: '#217346', type: 'Excel' },
                'xlsx': { icon: 'file-excel-box', color: '#217346', type: 'Excel' },
                'ppt': { icon: 'file-powerpoint-box', color: '#D24726', type: 'PowerPoint' },
                'pptx': { icon: 'file-powerpoint-box', color: '#D24726', type: 'PowerPoint' },
                'zip': { icon: 'folder-zip', color: '#FFA000', type: 'Archivo comprimido' },
                'rar': { icon: 'folder-zip', color: '#FFA000', type: 'Archivo comprimido' },
                'jpg': { icon: 'file-image', color: '#7C4DFF', type: 'Imagen' },
                'jpeg': { icon: 'file-image', color: '#7C4DFF', type: 'Imagen' },
                'png': { icon: 'file-image', color: '#7C4DFF', type: 'Imagen' },
                'mp4': { icon: 'file-video', color: '#E91E63', type: 'Video' },
                'mp3': { icon: 'file-music', color: '#00BCD4', type: 'Audio' },
                'txt': { icon: 'file-document', color: '#607D8B', type: 'Texto' },
            };
            
            return fileIconsLight[extension] || { icon: 'file-document-outline', color: '#666', type: 'Archivo' };
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
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
                        
                        {htmlText && htmlText.html && (
                            <View style={[
                                styles.cardContainer, 
                                { 
                                    backgroundColor: themeColors.backgroundCard, 
                                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
                                }
                            ]}>
                                <RenderHtml
                                    contentWidth={width - 64}
                                    source={htmlText}
                                    tagsStyles={htmlStyles}
                                    baseStyle={{
                                        color: themeColors.textPrimary,
                                    }}
                                />
                            </View>
                        )}
                    </>
                )}

                {/* ========== HTML CONTENT (WIKIS / NO-YOUTUBE) ========== */}
                {!isYouTube && htmlText && htmlText.html && (
                    <View style={[
                        styles.cardContainer, 
                        { 
                            backgroundColor: themeColors.backgroundCard, 
                            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
                        }
                    ]}>
                        <RenderHtml
                            contentWidth={width - 64}
                            source={htmlText}
                            tagsStyles={htmlStyles}
                            baseStyle={{
                                color: themeColors.textPrimary,
                            }}
                        />
                    </View>
                )}

                {/* ========== PREVIEW WEBVIEW (URLs que no son YouTube ni archivos) ========== */}
                {url && !downloadFile && !isYouTube && (
                    <View style={[
                        styles.cardContainer, 
                        { 
                            backgroundColor: themeColors.backgroundCard, 
                            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
                        }
                    ]}>
                        <WebView
                            source={{uri: url.trim()}}
                            style={styles.webview}
                        />
                    </View>
                )}

                {/* ========== DOWNLOAD SECTION ========== */}
                {url && downloadFile && (
                    <View style={styles.downloadContainer}>
                        <View style={[
                            styles.fileInfoCard, 
                            { 
                                backgroundColor: themeColors.backgroundCard,
                                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
                            }
                        ]}>
                            <View style={[
                                styles.fileIconContainer, 
                                { 
                                    backgroundColor: isDarkTheme 
                                        ? `${getFileInfo(url).color}20`
                                        : `${getFileInfo(url).color}15` 
                                }
                            ]}>
                                <Icon 
                                    name={getFileInfo(url).icon} 
                                    size={64} 
                                    color={getFileInfo(url).color} 
                                />
                            </View>
                            
                            <View style={styles.fileDetails}>
                                <Text style={[styles.fileType, { color: getFileInfo(url).color }]}>
                                    {getFileInfo(url).type}
                                </Text>
                                <Text style={[styles.fileName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                                    {url.split('/').pop() || 'Documento'}
                                </Text>
                                <Text style={[styles.fileHint, { color: themeColors.textSecondary }]}>
                                    Toca el botón para descargar
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.downloadButton, 
                                { 
                                    backgroundColor: isDarkTheme ? '#2A2F35' : themeColors.textPrimary,
                                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                                    borderWidth: isDarkTheme ? 1 : 0
                                }
                            ]}
                            onPress={() => {
                                fnDownloadFile(url);
                                setDownloaded(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <Icon 
                                name={downloaded ? "check-circle" : "download"} 
                                size={22} 
                                color={isDarkTheme ? '#9DB4C8' : themeColors.backgroundCard} 
                            />
                            <Text style={[
                                styles.downloadText, 
                                { color: isDarkTheme ? '#9DB4C8' : themeColors.backgroundCard }
                            ]}>
                                {downloaded ? 'Descargado ✓' : 'Descargar archivo'}
                            </Text>
                        </TouchableOpacity>
                        
                        {downloaded && (
                            <View style={[
                                styles.successMessage,
                                {
                                    backgroundColor: isDarkTheme ? '#2D352E' : '#E8F5E9',
                                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : '#A5D6A7',
                                }
                            ]}>
                                <Icon 
                                    name="check-circle" 
                                    size={20} 
                                    color={isDarkTheme ? '#A8C4A8' : '#34C759'} 
                                />
                                <Text style={[
                                    styles.successText,
                                    { color: isDarkTheme ? '#A8C4A8' : '#34C759' }
                                ]}>
                                    Archivo descargado exitosamente
                                </Text>
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
        marginBottom: 0,
    },
    
    cardContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    webview: {
        width: '100%',
        height: 400,
        borderRadius: 8,
    },
    
    downloadContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    
    fileInfoCard: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    fileIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    fileDetails: {
        alignItems: 'center',
        width: '100%',
    },
    fileType: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    fileHint: {
        fontSize: 13,
        textAlign: 'center',
    },
    
    downloadButton: {
        flexDirection: 'row',
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
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    
    successMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
    },
    successText: {
        fontSize: 14,
        fontWeight: '600',
    },
});