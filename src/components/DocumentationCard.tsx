import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { colors, statusColorsDoc, statusIconDoc } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { IntDocumentationCard } from '../interfaces/appInterfaces';

interface PropsDocumentationCard {
  data_doc: IntDocumentationCard;
  onPressEvnt: boolean;
}

const DocumentationCard = ({ data_doc, onPressEvnt = true }: PropsDocumentationCard) => {
  const navigation = useNavigation<any>();

  const onPressTP = onPressEvnt 
    ? () => navigation.navigate('DocumentationDetails', { documentation: data_doc })
    : () => {};

  const getStatusConfig = (status: string) => {
    // Normalizar el estatus para comparación
    const normalizedStatus = status.toLowerCase().trim();
    
    // Mapeo de estatus con colores e íconos
    const statusMap: {[key: string]: {color: string, icon: string}} = {
      'pendiente': { color: '#FF9500', icon: 'clock-outline' },
      'entregado': { color: '#1976D2', icon: 'check-circle-outline' },
      'aprobado': { color: '#34C759', icon: 'check-circle' },
      'rechazado': { color: '#FF3B30', icon: 'close-circle-outline' },
      'en revisión': { color: '#1976D2', icon: 'eye-outline' },
      'revision': { color: '#1976D2', icon: 'eye-outline' },
    };

    // Buscar el estatus normalizado
    const config = statusMap[normalizedStatus];
    
    if (config) {
      return config;
    }

    // Intentar con statusColorsDoc y statusIconDoc del theme si existen
    const themeColor = statusColorsDoc?.[status];
    const themeIcon = statusIconDoc?.[status];

    if (themeColor || themeIcon) {
      return {
        color: themeColor || '#666',
        icon: themeIcon || 'file-document-outline'
      };
    }

    // Default
    return { color: '#666', icon: 'file-document-outline' };
  };

  const statusConfig = getStatusConfig(data_doc.est_doc_alu_ram);

  return (
    <TouchableOpacity 
      onPress={onPressTP}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="file-document-outline" size={24} color="#666" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.documentName} numberOfLines={2}>
            {data_doc.nom_doc_ram}
          </Text>
          {data_doc.fec_doc_alu_ram && (
            <Text style={styles.date}>
              {formatDate(data_doc.fec_doc_alu_ram)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: statusConfig.color + '20' }
        ]}>
          <Icon 
            name={statusConfig.icon} 
            size={16} 
            color={statusConfig.color} 
          />
          <Text style={[
            styles.statusText,
            { color: statusConfig.color }
          ]}>
            {data_doc.est_doc_alu_ram}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default DocumentationCard;