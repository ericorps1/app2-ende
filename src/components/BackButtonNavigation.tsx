import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { platformTheme, colors } from '../theme/platformTheme';

interface PropsBackButtonNavigation {
    onPressBack: () => void;
    title: string;
}

export const BackButtonNavigation = ({onPressBack, title}: PropsBackButtonNavigation) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        activeOpacity={0.7}
        onPress={onPressBack}
      >
        <FontAwesome5Icon 
          name="chevron-left" 
          size={18} 
          color="#374151" 
        />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      
      <View style={styles.placeholder} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  
  placeholder: {
    width: 40,
    height: 40,
  },
});