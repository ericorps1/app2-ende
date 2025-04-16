import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Paragraph, Dialog, Portal, Provider, Button } from 'react-native-paper';
import { colors } from '../theme/platformTheme';

interface PropsPaperConfirmElimComentario {
    com_id: number;
    visible: boolean;
    title: string;
    text: string;
    evDismiss: () => void;
    pressDelete: (com_id:number) => void;
    btnDisabled: boolean;
}

export const PaperConfirmElimComentario = ({com_id,visible,title,text,evDismiss,pressDelete,btnDisabled}:PropsPaperConfirmElimComentario) => {
    return (
        <Provider>
            <Portal>
                <Dialog visible={visible} onDismiss={evDismiss}>
                    {/* <Dialog.Icon icon="alert" /> */}
                    <Dialog.Title style={styles.title}>{ title }</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{ text }</Paragraph>
                    </Dialog.Content>
                    <Button 
                        style={styles.btnAceptar}
                        icon="delete"
                        mode="outlined"
                        onPress={()=>pressDelete(com_id)}
                        color={colors.darkBlue}
                        loading={btnDisabled}
                    >
                        ELIMINAR
                    </Button>
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
  }
})