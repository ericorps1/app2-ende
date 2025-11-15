import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';

interface PropsStepsPagination {
    infoRenderSteps: any[]
}

export default function StepsPagination({infoRenderSteps}:PropsStepsPagination) {
  return (
    <View style={styles.container}>
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
    backgroundColor: '#F5F5F5',
  },
});