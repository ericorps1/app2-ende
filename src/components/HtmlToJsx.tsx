import React from 'react'
import RenderHtml, { CustomBlockRenderer } from 'react-native-render-html';
import { Platform, Text, useWindowDimensions, useColorScheme } from 'react-native';
import { cleanHtmlRenderHtml } from '../hooks/useFormats';
import { useTheme } from '../context/ThemeContext';

interface PropsHtmlToJsx {
    strHtml: string;
    styles?: string;
    isDarkMode?: boolean;
}

export const HtmlToJsx = ({
    strHtml,
    styles='margin: 10px; padding-bottom: 10px',
    isDarkMode: propIsDarkMode
}: PropsHtmlToJsx) => {
    const { theme, colors: themeColors } = useTheme();
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    
    // 🌙 Detectar dark mode (usa prop si existe, sino detecta del contexto)
    const isDarkMode = propIsDarkMode !== undefined 
        ? propIsDarkMode 
        : theme === 'dark' || colorScheme === 'dark';
    
    const widthRender = Platform.OS !== 'ios' ? width-100 : width;
    
    // 🎨 CUSTOM RENDERERS CON DARK MODE
    const TableRenderer: CustomBlockRenderer = function TableRenderer({ TDefaultRenderer, ...props }) {
        return <TDefaultRenderer 
            {...props} 
            style={{ 
                ...props.style, 
                maxWidth: width-80, 
                borderColor: isDarkMode ? '#404040' : '#000000',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF'
            }}
        />;
    }
    
    const TrRenderer: CustomBlockRenderer = function TrRenderer({ TDefaultRenderer, ...props }) {
        return <TDefaultRenderer 
            {...props} 
            style={{ 
                ...props.style, 
                height: 'auto', 
                borderWidth: 1,
                borderColor: isDarkMode ? '#404040' : '#000000'
            }}
        />;
    }
    
    const TdRenderer: CustomBlockRenderer = function TdRenderer({ TDefaultRenderer, ...props }) {
        return <TDefaultRenderer 
            {...props} 
            style={{ 
                ...props.style, 
                height: 'auto', 
                borderWidth: 1,
                borderColor: isDarkMode ? '#404040' : '#000000',
                color: isDarkMode ? '#e0e0e0' : '#1a1a1a'
            }}
        />;
    }

    const renderers = { td: TdRenderer, tr: TrRenderer, table: TableRenderer }
    const cleanHTML = cleanHtmlRenderHtml(strHtml);
    
    return (
        <RenderHtml
            contentWidth={width-10}
            source={{
                html: `<div style="width: ${width};${styles};color: ${isDarkMode ? '#e0e0e0' : '#1a1a1a'};background-color: ${isDarkMode ? '#1a1a1a' : '#FFFFFF'};">${cleanHTML}</div>`
            }}
            renderers={renderers}
            tagsStyles={{
                p: {
                    maxWidth: widthRender,
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                    marginBottom: 8,
                },
                strong: {
                    maxWidth: widthRender,
                    margin: 0,
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontWeight: '700',
                },
                b: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontWeight: '700',
                },
                h1: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 24,
                    fontWeight: '700',
                },
                h2: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 20,
                    fontWeight: '700',
                },
                h3: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 18,
                    fontWeight: '700',
                },
                h4: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 16,
                    fontWeight: '700',
                },
                h5: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 14,
                    fontWeight: '700',
                },
                h6: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 12,
                    fontWeight: '700',
                },
                a: {
                    color: isDarkMode ? '#60a5fa' : '#2563eb',
                    textDecorationLine: 'underline',
                },
                em: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                    fontStyle: 'italic',
                },
                i: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                    fontStyle: 'italic',
                },
                ul: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                },
                ol: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                },
                li: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                },
                blockquote: {
                    color: isDarkMode ? '#b0b0b0' : '#666666',
                    borderLeftColor: isDarkMode ? '#404040' : '#e0e0e0',
                    borderLeftWidth: 4,
                    paddingLeft: 12,
                    fontStyle: 'italic',
                },
                code: {
                    color: isDarkMode ? '#ff6b9d' : '#e91e63',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                    fontFamily: 'monospace',
                },
                pre: {
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    padding: 12,
                    borderRadius: 8,
                },
                span: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                },
                div: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                },
            }}
            defaultTextProps={{
                style: {
                    color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                },
            }}
        />
    )
}