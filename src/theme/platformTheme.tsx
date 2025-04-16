import { StyleSheet } from "react-native";

export const colors = {
    success: '#47C9A2',
    primary: '#4687A3',
    info: '#1151D3',
    error: '#F56E5B',
    danger: '#E53D35',
    warning: '#FFBB33',
    darkBlue: '#202F5B',
    darkSilver: '#2B2B2B',
    silver: '#606464',
    mediumSilver: '#777',
    softBlue: '#BDD8FE',
    softSilver: '#E8E8E8',
    softGreen: '#CEFFE6',
    green: '#69BB79',
    dark: '#2A2A2A',
    blue: '#62a8c6',
    yellow: '#ffc107',
    chatGreen: '#dcf8c6',
    white: '#FFFFFF',
}

export const statusColors = {
  "Pagado": colors.success,
  "Pendiente": colors.warning,
  "Vencido": colors.error,
};

export const platformTheme = StyleSheet.create({
    paymentCard: {
        flex: 1,
        // paddingHorizontal: 20,
        justifyContent: 'flex-end',
        // height: 100,
        borderRadius: 10,
        // alignItems: 'flex-start',
        // justifyContent: 'space-around',
        marginTop: 15,
        marginHorizontal: 10,
        borderWidth: 0.5,
        borderColor: colors.darkBlue
    },
    title: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    noDataText: {
        textAlign: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        fontSize: 20,
        fontWeight: '600'
    },
    fila: {
      // backgroundColor: 'blue',
      flexDirection: 'row',
    //   justifyContent: 'center',
      // backgroundColor: 'red',
      // borderWidth: 1
    },
    iconBack: {
        flex: 1,
        textAlign: 'left',
        width: 30, 
    },
    avatarContent: {
        alignItems: 'center',
        padding: 10
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 100,
        backgroundColor: colors.darkBlue,
    },
    avatarName: {
        fontSize: 25,
        color: colors.darkBlue,
        textAlign: 'center',
        marginBottom: 10,
    },
    menuContainer: {
        alignItems: 'center'
    },
    menuTexto: {
        fontSize: 20,
        color: colors.darkBlue,
        textAlign: 'center'
    },
    menuBoton: {
        paddingVertical: 10,
        // backgroundColor: 'red',
        width: '100%',
    },
    viewLine: {
        flex: 1,
        borderBottomColor: colors.softSilver,
        borderBottomWidth: 1
    },
    btn: {
        marginHorizontal: 5,
    },
    btnSuccess: {
        backgroundColor: colors.success
    },
    btnInfo: {
        backgroundColor: colors.info
    },
    btnDanger: {
        backgroundColor: colors.error
    },
    btnDarkBlue: {
        backgroundColor: colors.darkBlue
    },
    btnBlue: {
        backgroundColor: colors.blue
    },
    btnSilver: {
        backgroundColor: colors.silver
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: '5%',
        borderRadius: 5,
    },
    modalContainerTitle: {
        fontSize: 25,
        fontWeight: '800',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.softSilver,
        paddingBottom: 10,
    },
    modalContainerText: {
        fontSize: 16,
        color: colors.darkBlue,
        marginBottom: 20
    },
    btnDownload: {
        backgroundColor: colors.darkBlue,
        padding: 5,
        borderRadius: 10,
    },
    btnDownloadText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18
    },
    shadowBox: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,  
        elevation: 10
    }
});