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
        <Provider>
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
                            color={colors.error}
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
                            color={colors.darkSilver}
                            loading={btnDisabled}
                            disabled={btnDisabled}
                        >
                            CANCELAR
                        </Button>
                    </View>
                </Dialog>
            </Portal>
        </Provider>
    );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  btnAceptar: {
    margin: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  btnCancelar: {
    margin: 10,
    borderWidth: 1,
    borderColor: colors.darkSilver,
  }
})