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

export const Documentacion = () => {
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data_alumno } = useContext( AuthContext );
  const [documentacion, setDocumentacion] = useState([]);
  
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
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#000"
          colors={['#000']}
        />
      }
    >
      {/* HEADER */}
      <View style={styles.headerSection}>
        <Icon name="file-document-multiple-outline" size={28} color="#000" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Documentación</Text>
          <Text style={styles.headerSubtitle}>
            {documentacion.length} {documentacion.length === 1 ? 'documento' : 'documentos'}
          </Text>
        </View>
      </View>

      {/* DOCUMENTOS */}
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
          <Icon name="file-document-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No hay documentación disponible</Text>
          <Text style={styles.emptyStateSubtext}>
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
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: '#000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
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
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});