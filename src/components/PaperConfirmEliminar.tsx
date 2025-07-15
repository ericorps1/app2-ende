import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Paragraph, Dialog, Portal, Provider, Button } from 'react-native-paper';
import { colors, platformTheme } from '../theme/platformTheme';

interface PropsPaperConfirmEliminar {
    visible: boolean;
    title: string;
    text: string;
    evDismiss: () => void;
    pressDelete: () => void;
    btnDisabled: boolean;
}

export const PaperConfirmEliminar = ({visible,title,text,evDismiss,pressDelete,btnDisabled}:PropsPaperConfirmEliminar) => {
    return (
      <Portal>
        <Dialog visible={visible} onDismiss={evDismiss}>
          {/* <Dialog.Icon icon="alert" /> */}
          <Dialog.Title style={styles.title}>{ title }</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{ text }</Paragraph>
          </Dialog.Content>
          <View style={{ ...platformTheme.fila, alignSelf: 'center' }}>
            <Button 
              style={styles.btnAceptar}
              icon="delete"
              mode="outlined"
              onPress={pressDelete}
              textColor={colors.white}
              loading={btnDisabled}
              disabled={btnDisabled}
            >
              ELIMINAR
            </Button>
            <Button 
              style={styles.btnCancelar}
              icon="cancel"
              mode="outlined"
              onPress={evDismiss}
              textColor={colors.white}
              loading={btnDisabled}
              disabled={btnDisabled}
            >
              CANCELAR
            </Button>
          </View>
        </Dialog>
      </Portal>
    );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  btnAceptar: {
    ...platformTheme.btn,
    ...platformTheme.btnDanger,
    margin: 10,
    borderColor: colors.error,
  },
  btnCancelar: {
    ...platformTheme.btnPrimary,
    margin: 10,
  }
})