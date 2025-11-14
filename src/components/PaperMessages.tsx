import * as React from 'react';
import { View, ColorValue, Text } from 'react-native';
import { Button, Paragraph, Dialog, Portal } from 'react-native-paper';
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
    evtBtnCancel?: () => void;
    loading?: boolean;
}

const PaperMessages = ({
  visible,
  title,
  message,
  buttonText,
  dismissable,
  styleButton=platformTheme.btnSuccess,
  colorTitle=colors.darkBlue,
  colorBody=colors.darkSilver,
  onDismiss=() => {return false},
  pressButton=() => {return false},
  btnTxtCancel='',
  styleBtnCancel=platformTheme.btnDanger,
  evtBtnCancel=()=>{return false},
  loading=false
}:PropsPaperMessages) => {
  return (
    <View>
      <Portal>
        <Dialog visible={visible} dismissable={dismissable && !loading} onDismiss={onDismiss}>
          <Dialog.Title style={{color: colorTitle }}>{ title }</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{color: colorBody }}>{ message }</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            {btnTxtCancel!=='' &&
              <Button
                textColor='white'
                style={ [{marginRight: 5},styleBtnCancel] }
                onPress={evtBtnCancel}
                loading={loading}
                disabled={loading}
              > { btnTxtCancel } </Button>}
            <Button
              textColor='white'
              style={ styleButton }
              onPress={pressButton}
              loading={loading}
              disabled={loading}
            > { buttonText } </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default PaperMessages;
