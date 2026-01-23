import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { useTheme } from '../context/ThemeContext';

interface PropsStepsPagination {
    infoRenderSteps: any[]
}

export default function StepsPagination({infoRenderSteps}:PropsStepsPagination) {
  const { colors: themeColors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Swiper
        loop={false}
        autoplay={false}
        showsButtons={false}
        showsPagination={false}
      >
        {infoRenderSteps.map((element) => element)}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});