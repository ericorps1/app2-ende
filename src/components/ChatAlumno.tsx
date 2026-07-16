import React, {useState,useEffect,useContext} from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useAppSelector } from '../app/hooks';
import { colors, platformTheme } from '../theme/platformTheme';
import { FotoPerfil } from './FotoPerfil';
import cafeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { useRef } from 'react';
import { MensajesChatAlumno } from './MensajesChatAlumno';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 🔥 NUEVO

export const ChatAlumno = () => {
  const { theme, colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets(); // 🔥 NUEVO
  const colorScheme = useColorScheme();
  
  const [visibleChat, setVisibleChat] = useState(false);
  const [idSala, setIdSala] = useState(0);
  const { data_alumno } = useContext( AuthContext );
  const { id_pro, nom_pro, fot_emp, tipo, id_sub_hor, materia } = useAppSelector(state => state.datachat);
  
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';
  
  useEffect(() => {
    getSala();
  }, [])
  
  const getSala = async() => {
    const {data} = await cafeApi.get(`sala/salaEstudianteProfesor/${data_alumno?.id_alu}/${id_pro}`);
    if(data.trans){
      if(data.data.length){
        setIdSala(data.data[0].id_sal);
      }
    }
  }
  
  return (
    <View style={[
      styles.container, 
      { 
        paddingBottom: insets.bottom, // 🔥 SAFE AREA
        backgroundColor: isDarkMode ? themeColors.backgroundCard : 'white',
        borderTopColor: isDarkMode ? themeColors.borderGray : colors.darkSilver,
        borderLeftColor: isDarkMode ? themeColors.borderGray : colors.darkSilver,
      }
    ]}>
      <TouchableOpacity 
        activeOpacity={0.5}
        style={styles.containerMinimize} 
        onPress={()=>setVisibleChat(!visibleChat)}
      >
        <FotoPerfil 
          foto={fot_emp}
          nom_alu={nom_pro}
          size={35}
          style={styles.fotoProfesorMin}
        />
        <View style={styles.containerName}>
          <Text style={[styles.textName, { color: isDarkMode ? themeColors.textPrimary : colors.darkBlue }]}>
            {nom_pro}
          </Text>
          <Text style={[styles.textRol, { color: isDarkMode ? themeColors.textSecondary : colors.darkGray }]}>
            {tipo}
          </Text>
        </View>
      </TouchableOpacity>
      {
        visibleChat && <View style={[styles.containerChatHistory, {
          borderTopColor: isDarkMode ? themeColors.borderGray : colors.darkSilver,
        }]}>
          <MensajesChatAlumno 
            id_sal={idSala}
            id_pro={id_pro}
            welcomeMsg={<View style={platformTheme.fila}>
                  <FotoPerfil 
                    foto={fot_emp}
                    nom_alu={nom_pro}
                    size={80}
                    style={styles.fotoProfesorMax}
                  />
                  <View style={styles.containerWelcomeMsg}>
                    <Text style={[styles.textWelcomeTitle, { 
                      color: isDarkMode ? themeColors.textPrimary : colors.darkBlue 
                    }]}>
                      Soy tu profesor de {materia}, bienvenido a ENDE Ecatepec.
                    </Text>
                    <Text style={[styles.textWelcomeDescription, { 
                      color: isDarkMode ? themeColors.textSecondary : colors.darkGray 
                    }]}>
                      Cualquier duda, mándame un mensaje y a la brevedad te contesto ;
                    </Text>
                  </View>
              </View>
            }
          />
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...platformTheme.shadowBox,
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 999,
    borderTopStartRadius: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    width: '100%',
  },
  containerMinimize: {
    ...platformTheme.fila,
    marginHorizontal: 10,
  },
  fotoProfesorMin: {
    borderRadius: 30,
    marginVertical: 10,
    marginRight: 10,
    width: 50,
    height: 50,
  },
  containerName: {
    alignSelf: 'center'
  },
  textName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textRol: {
    fontSize: 15,
  },
  containerChatHistory: {
    borderTopWidth: 1,
    padding: 10,
  },
  textMsgFile: {
    color: colors.blue
  },
  fotoProfesorMax: {
    borderRadius: 10,
    marginVertical: 10,
    marginRight: 10,
    width: 60,
    height: 80,
  },
  containerWelcomeMsg: {
    flex: 1,
    paddingTop: 10
  },
  textWelcomeTitle: {
    fontWeight: 'bold'
  },
  textWelcomeDescription: {
    fontSize: 12
  }
});