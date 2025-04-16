// import React, { useState } from 'react'
// import { View } from 'react-native';
// import { Button } from 'react-native-paper';
// import StepIndicator from "react-native-step-indicator";
// import { colors } from '../theme/platformTheme';

// export const StepsPagination = () => {
//     const [currentPosition, setCurrentPosition] = useState(0)
//     const labels = ["Cart","Delivery Address","Order Summary","Payment Method","Track"];
//     const customStyles = {
//         stepIndicatorSize: 25,
//         currentStepIndicatorSize:30,
//         separatorStrokeWidth: 2,
//         currentStepStrokeWidth: 3,
//         stepStrokeCurrentColor: colors.darkBlue,
//         stepStrokeWidth: 3,
//         stepStrokeFinishedColor: colors.darkBlue,
//         stepStrokeUnFinishedColor: colors.softBlue,
//         separatorFinishedColor: colors.darkBlue,
//         separatorUnFinishedColor: colors.softBlue,
//         stepIndicatorFinishedColor: colors.darkBlue,
//         stepIndicatorUnFinishedColor: colors.softBlue,
//         stepIndicatorCurrentColor: colors.darkSilver,
//         stepIndicatorLabelFontSize: 13,
//         currentStepIndicatorLabelFontSize: 13,
//         stepIndicatorLabelCurrentColor: 'white',
//         stepIndicatorLabelFinishedColor: 'white',
//         stepIndicatorLabelUnFinishedColor: colors.darkBlue,
//         labelColor: colors.darkBlue,
//         labelSize: 13,
//         currentStepLabelColor: colors.darkSilver
//     }
//     const onPageChange = (position:number) =>{
//         setCurrentPosition(position);
//     }
//     return (
//         <View>
//             <StepIndicator
//                 customStyles={customStyles}
//                 currentPosition={currentPosition}
//                 labels={labels}

//             />
//             <Button
//                 onPress={()=>onPageChange(currentPosition+1)}
//             >Siguiente</Button>
//         </View>
//     )
// }





/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import Swiper from 'react-native-swiper';

interface PropsStepsPagination {
    infoRenderSteps: any[]
}

export default function StepPagination({infoRenderSteps}:PropsStepsPagination) {
  const [currentPage, setCurrentPage] = React.useState<number>(0);

  return (
    <View style={styles.container}>
      <Swiper
        loop={false}
        index={currentPage}
        autoplay={false}
        showsButtons={false}
        showsPagination={true}
        
      >
        {infoRenderSteps.map((element) => element)}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  stepIndicator: {
    marginTop: 20,
  },
  page: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    color: '#999999',
  },
  stepLabelSelected: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    color: '#4aae4f',
  },
});