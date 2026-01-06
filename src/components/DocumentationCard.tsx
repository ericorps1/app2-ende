import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { colors, statusColorsDoc, statusIconDoc } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { IntDocumentationCard } from '../interfaces/appInterfaces';
import { useTheme } from '../context/ThemeContext';

interface PropsDocumentationCard {
  data_doc: IntDocumentationCard;
  onPressEvnt: boolean;
}

const DocumentationCard = ({ data_doc, onPressEvnt = true }: PropsDocumentationCard) => {
  const { colors: themeColors } = useTheme();
  const navigation = useNavigation<any>();

  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
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
    
    return isDark;
  })();

  const onPressTP = onPressEvnt 
    ? () => navigation.navigate('DocumentationDetails', { documentation: data_doc })
    : () => {};

  const getStatusConfig = (status: string | undefined | null) => {
    if (!status) {
      return { 
        color: isDarkTheme ? '#A8A8A8' : '#666', 
        icon: 'file-document-outline',
        badgeBg: isDarkTheme ? '#2B2B2B' : '#66666620'
      };
    }

    const normalizedStatus = status.toLowerCase().trim();
    
    if (isDarkTheme) {
      const statusMap: {[key: string]: {color: string, icon: string, badgeBg: string}} = {
        'pendiente': { 
          color: '#D4BDA0',
          icon: 'clock-outline',
          badgeBg: '#352F2A'
        },
        'entregado': { 
          color: '#9DB4C8',
          icon: 'check-circle-outline',
          badgeBg: '#2A2F35'
        },
        'aprobado': { 
          color: '#A8C4A8',
          icon: 'check-circle',
          badgeBg: '#2D352E'
        },
        'rechazado': { 
          color: '#D0A8A0',
          icon: 'close-circle-outline',
          badgeBg: '#382E2D'
        },
        'en revisión': { 
          color: '#9DB4C8',
          icon: 'eye-outline',
          badgeBg: '#2A2F35'
        },
        'revision': { 
          color: '#9DB4C8',
          icon: 'eye-outline',
          badgeBg: '#2A2F35'
        },
      };

      return statusMap[normalizedStatus] || { 
        color: '#A8A8A8', 
        icon: 'file-document-outline',
        badgeBg: '#2B2B2B'
      };
    } else {
      const statusMap: {[key: string]: {color: string, icon: string, badgeBg: string}} = {
        'pendiente': { color: '#FF9500', icon: 'clock-outline', badgeBg: '#FF950020' },
        'entregado': { color: '#1976D2', icon: 'check-circle-outline', badgeBg: '#1976D220' },
        'aprobado': { color: '#34C759', icon: 'check-circle', badgeBg: '#34C75920' },
        'rechazado': { color: '#FF3B30', icon: 'close-circle-outline', badgeBg: '#FF3B3020' },
        'en revisión': { color: '#1976D2', icon: 'eye-outline', badgeBg: '#1976D220' },
        'revision': { color: '#1976D2', icon: 'eye-outline', badgeBg: '#1976D220' },
      };

      const config = statusMap[normalizedStatus];
      
      if (config) {
        return config;
      }

      const themeColor = statusColorsDoc?.[status];
      const themeIcon = statusIconDoc?.[status];

      if (themeColor || themeIcon) {
        return {
          color: themeColor || '#666',
          icon: themeIcon || 'file-document-outline',
          badgeBg: (themeColor || '#666') + '20'
        };
      }

      return { 
        color: '#666', 
        icon: 'file-document-outline',
        badgeBg: '#66666620'
      };
    }
  };

  const statusConfig = getStatusConfig(data_doc.est_doc_alu_ram);

  return (
    <TouchableOpacity 
      onPress={onPressTP}
      style={[
        styles.card, 
        { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          borderWidth: isDarkTheme ? 1 : 0
        }
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
        ]}>
          <Icon 
            name="file-document-outline" 
            size={24} 
            color={isDarkTheme ? '#9DB4C8' : themeColors.textSecondary} 
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.documentName, { color: themeColors.textPrimary }]} numberOfLines={2}>
            {data_doc.nom_doc_ram || 'Sin nombre'}
          </Text>
          {data_doc.fec_doc_alu_ram ? (
            <Text style={[styles.date, { color: themeColors.textSecondary }]}>
              {formatDate(data_doc.fec_doc_alu_ram)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: statusConfig.badgeBg }
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
            {data_doc.est_doc_alu_ram || 'Sin estado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
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