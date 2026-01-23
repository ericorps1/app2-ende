import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import endeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { colors, platformTheme } from '../theme/platformTheme';
import { LoadingScreen } from '../screens/LoadingScreen';
import DocumentationCard from '../components/DocumentationCard';
import { IntDocumentationCard } from '../interfaces/appInterfaces';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export const Documentacion = () => {
  const { colors: themeColors } = useTheme();
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data_alumno } = useContext( AuthContext );
  const [documentacion, setDocumentacion] = useState([]);

  // Detección robusta del tema oscuro (propagado desde Actividades)
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 DOCUMENTACION - themeColors.background:', themeColors.background);
    console.log('🌓 DOCUMENTACION - themeColors.backgroundCard:', themeColors.backgroundCard);
    
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
    
    console.log('🌓 DOCUMENTACION - isDarkTheme resultado:', isDark);
    
    return isDark;
  })();
  
  useFocusEffect(
    useCallback(() => {
      getDocumentacion();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getDocumentacion();
    setRefreshing(false);
  };

  const getDocumentacion = async() => {
    setLoadingDoc(true);
    try {
      const {data} = await endeApi.get('/documento_alu_ram', { params: { 'id_alu_ram': data_alumno?.id_alu_ram } });
      if(data.data && data.data.length > 0){
        setDocumentacion(data.data);
      } else {
        setDocumentacion([]);
      }
    } catch (error) {
      console.log('Error getDocumentacion:', error);
      setDocumentacion([]);
    }
    setLoadingDoc(false);
  }

  if(loadingDoc) {
    return <LoadingScreen text='Cargando documentación...'/>;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeColors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={themeColors.textPrimary}
          colors={[themeColors.textPrimary]}
        />
      }
    >
      <View style={[
        styles.headerSection, 
        { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          borderWidth: isDarkTheme ? 1 : 0
        }
      ]}>
        <Icon 
          name="file-document-multiple-outline" 
          size={28} 
          color={isDarkTheme ? '#9DB4C8' : themeColors.textPrimary} 
        />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Documentación</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            {documentacion.length} {documentacion.length === 1 ? 'documento' : 'documentos'}
          </Text>
        </View>
      </View>

      {documentacion.length > 0 ? (
        <View style={styles.documentsContainer}>
          {documentacion.map((data_doc: IntDocumentationCard) => {
            return (
              <DocumentationCard 
                key={data_doc.id_doc_alu_ram} 
                data_doc={data_doc} 
                onPressEvnt={true} 
              />
            )
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon 
            name="file-document-outline" 
            size={64} 
            color={isDarkTheme ? '#444' : themeColors.borderGray} 
          />
          <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
            No hay documentación disponible
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: themeColors.textTertiary }]}>
            Los documentos aparecerán aquí cuando estén disponibles
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  documentsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});