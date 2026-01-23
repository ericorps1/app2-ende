import { StyleSheet } from "react-native";

export const colors = {
    success: '#17a2b8',
    primary: '#138496',
    info: '#17a2b8',
    error: '#F56E5B',
    danger: '#E53D35',
    warning: '#FFBB33',
    darkBlue: '#151e39',
    darkSilver: '#2B2B2B',
    silver: '#606464',
    mediumSilver: '#777',
    softBlue: '#3bb4c7',
    softSilver: '#E8E8E8',
    softGreen: '#CEFFE6',
    green: '#69BB79',
    dark: '#2A2A2A',
    blue: '#17a2b8',
    yellow: '#ffc107',
    chatGreen: '#dcf8c6',
    white: '#FFFFFF',
    
    // 🆕 COLORES PROFESIONALES UBER-STYLE
    black: '#000000',
    backgroundGray: '#F5F5F5',
    borderGray: '#E0E0E0',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
}

export const statusColors = {
  "Pagado": colors.success,
  "Pendiente": colors.warning,
  "Vencido": colors.error,
};

export const statusColorsDoc = {
  "Entregado": colors.info,
  "Aprobado": colors.success,
  "Validado": colors.success,
  "Pendiente": colors.error,
};

export const statusIconDoc = {
  "Entregado": 'check-circle',
  "Aprobado": 'check-circle',
  "Validado": 'check-circle',
  "Pendiente": 'exclamation-triangle',
}

export const platformTheme = StyleSheet.create({
  // 🆕 CONTAINERS MODERNOS
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 🆕 CARDS ESTILO UBER
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },

  cardElevated: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // 🆕 HEADERS PROFESIONALES
  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // 🆕 INPUTS MINIMALISTAS
  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  input: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderWidth: 2,
    borderColor: colors.black,
  },

  // 🆕 BOTONES ESTILO UBER
  buttonPrimary: {
    backgroundColor: colors.black,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  buttonSecondary: {
    backgroundColor: colors.white,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
  },

  buttonSecondaryText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },

  buttonGhost: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonGhostText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },

  // 🆕 LIST ITEMS UBER-STYLE
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundGray,
  },

  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  listItemContent: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },

  listItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // 🆕 AVATAR MINIMALISTA
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '600',
  },

  avatarName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },

  avatarSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // 🆕 MODALES MODERNOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },

  // 🆕 BADGES Y PILLS
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  badgeSuccess: {
    backgroundColor: '#E8F5E9',
  },

  badgeSuccessText: {
    color: '#2E7D32',
  },

  badgeWarning: {
    backgroundColor: '#FFF3E0',
  },

  badgeWarningText: {
    color: '#E65100',
  },

  badgeError: {
    backgroundColor: '#FFEBEE',
  },

  badgeErrorText: {
    color: '#C62828',
  },

  // 🆕 DIVIDERS
  divider: {
    height: 1,
    backgroundColor: colors.backgroundGray,
    marginVertical: 16,
  },

  dividerThick: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    marginVertical: 0,
  },

  // 🆕 SPACING UTILITIES
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mx16: { marginHorizontal: 16 },
  mx20: { marginHorizontal: 20 },
  px16: { paddingHorizontal: 16 },
  px20: { paddingHorizontal: 20 },
  py12: { paddingVertical: 12 },
  py16: { paddingVertical: 16 },

  // LEGACY (mantener para compatibilidad)
  paymentCard: {
      flex: 1,
      borderRadius: 10,
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
    flexDirection: 'row',
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
  btnPrimary: {
    backgroundColor: colors.primary
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
  btnSoftBlue: {
      backgroundColor: colors.softBlue
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
      backgroundColor: colors.primary,
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
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5
  }
});

// 🎨 CONFIGURACIÓN GLOBAL DE FUENTES (EMOJIS)
export const fontConfig = {
  default: {
    regular: {
      fontFamily: 'NotoColorEmoji',
      fontWeight: 'normal' as const,
    },
  },
};