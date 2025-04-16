import * as React from 'react';
import { View, ColorValue, Text } from 'react-native';
import { Button, Paragraph, Dialog, Portal, Provider, DefaultTheme } from 'react-native-paper';
import { StylessReactNativeProps } from 'react-native-render-html';
import { colors, platformTheme } from '../theme/platformTheme';

interface PropsPaperMessages {
    visible: boolean;
    title: string;
    message: any;
    buttonText: string;
    dismissable: boolean;
    styleButton?: any;
    colorTitle?: ColorValue;
    colorBody?: ColorValue;
    onDismiss?: () => void;
    pressButton?: () => void;
    btnTxtCancel?: string;
    styleBtnCancel?: any;
    evtBtnCancel?: () => void
}

const PaperMessages = ({visible, title, message, buttonText, dismissable, styleButton=platformTheme.btnSuccess, colorTitle=colors.darkBlue, colorBody=colors.darkSilver, onDismiss=() => {return false}, pressButton=() => {return false}, btnTxtCancel='', styleBtnCancel=platformTheme.btnDanger, evtBtnCancel=()=>{return false}}:PropsPaperMessages) => {
  return (
    <Provider theme={DefaultTheme}>
      <View>
        <Portal>
          <Dialog visible={visible} dismissable={dismissable} onDismiss={onDismiss}>
            <Dialog.Title style={{color: colorTitle }}>{ title }</Dialog.Title>
            <Dialog.Content>
              <Paragraph style={{color: colorBody }}>{ message }</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              {btnTxtCancel!=='' && <Button color='white' style={ [{marginRight: 5},styleBtnCancel] } onPress={evtBtnCancel}> { btnTxtCancel } </Button>}
              <Button color='white' style={ styleButton } onPress={pressButton}> { buttonText } </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

export default PaperMessages;
