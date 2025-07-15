import React from 'react';
import { Text, View, ColorValue, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { colors, platformTheme } from '../theme/platformTheme';

interface RecursoTeoricoProps {
  icon: string;
  text: string;
  iconColor: ColorValue;
  onPress: () => void;
}

export const RecursoTeorico = ({ icon, text, iconColor, onPress }: RecursoTeoricoProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <FontAwesome5Icon name={icon} color="#fff" style={styles.icon} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f7f9fc',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 22,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkBlue,
  },
});
