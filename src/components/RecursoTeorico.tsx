import React from 'react';
import { Text, View, ColorValue, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RecursoTeoricoProps {
  icon: string;
  text: string;
  iconColor?: ColorValue;
  onPress: () => void;
}

export const RecursoTeorico = ({ icon, text, iconColor = '#000', onPress }: RecursoTeoricoProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.text} numberOfLines={2}>{text}</Text>
      <Icon name="chevron-right" size={18} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
});