import React, { useContext, useEffect, useState } from 'react'
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Cuenta } from '../screens/Cuenta';
import { Home } from '../screens/Home';
import { Materias } from '../screens/Materias';
import { Mensajes } from '../screens/Mensajes';
import { Pagos } from '../screens/Pagos';
import { AuthContext } from '../context/AuthContext';
import { Image, Linking, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { platformTheme, colors } from '../theme/platformTheme';
import { Avatar } from 'react-native-paper';
import { FormatNameAvatar } from '../hooks/useFormats';
import endeApi from '../api/estudianteAPI';
import PaperMessages from '../components/PaperMessages';
import { Actividades } from '../screens/Actividades';
import { Horario } from '../screens/Horario';
import { Calificaciones } from '../screens/Calificaciones';
import { HeaderRight } from '../components/HeaderRight';
import { useAppDispatch } from '../app/hooks';
import { addNotifications } from '../features/notifications/dataNotificationsSlice';
import { Documentacion } from '../screens/Documentacion';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const Drawer = createDrawerNavigator();

export default function MenuNavigator() {
  const { colors: themeColors } = useTheme();
  const { data_alumno, logOut } = useContext( AuthContext );
  const [modalInactiveUser, setmodalInactiveUser] = useState(data_alumno?.est_alu && data_alumno?.est_alu !== 'Activo');

  const handleAcceptInactiveUser = () => {
    setmodalInactiveUser(false);
    logOut();
  }

  return (
    (modalInactiveUser)
      ?
        <PaperMessages
          visible={modalInactiveUser}
          title='Usuario inactivo'
          message={`Para continuar, agradeceríamos que te comunicaras al ${data_alumno?.tel_pla} a la brevedad, con la finalidad de resolver el problema. Gracias`}
          buttonText='ACEPTAR'
          dismissable={false}
          colorTitle={colors.danger}
          colorBody={colors.darkBlue}
          pressButton = { handleAcceptInactiveUser }
        />
      :
        <Drawer.Navigator
          drawerContent={ (props:any) => <ContenidoMenu { ...props }/> }
          screenOptions={{
            drawerStyle: {
              backgroundColor: themeColors.background,
            },
            drawerActiveBackgroundColor: themeColors.textPrimary,
            drawerActiveTintColor: themeColors.backgroundCard,
            drawerInactiveTintColor: themeColors.textSecondary,
            drawerLabelStyle: {
              fontSize: 14,
              fontWeight: '600',
            },
            drawerItemStyle: {
              borderRadius: 8,
              marginHorizontal: 8,
              marginVertical: 2,
              paddingHorizontal: 8,
            },
            headerStyle: {
              backgroundColor: themeColors.backgroundCard,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.borderGray,
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '700',
              color: themeColors.textPrimary,
            },
            headerTintColor: themeColors.textPrimary,
            headerRight: () => <HeaderRight/>,
          }}
        >
          <Drawer.Screen 
            name="Inicio" 
            component={Home}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Pagos" 
            component={Pagos}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="credit-card-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Mensajes" 
            component={Mensajes}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="message-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Actividades" 
            component={Actividades}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="clipboard-text-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Horario" 
            component={Horario}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="calendar-clock" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Calificaciones" 
            component={Calificaciones}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="chart-line" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Documentación" 
            component={Documentacion}
            options={{
              drawerIcon: ({ color, size }) => (
                <Icon name="file-document-multiple-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen 
            name="Cuenta" 
            component={Cuenta} 
            options={{drawerItemStyle:{display: 'none'}}}
          />
          <Drawer.Screen 
            name="Materias" 
            component={Materias} 
            options={{drawerItemStyle:{display: 'none'}}}
          />
        </Drawer.Navigator>
  );
}

const ContenidoMenu = (props: DrawerContentComponentProps) => {
  const { theme, toggleTheme, colors: themeColors } = useTheme();
  const navigation = props.navigation;
  const { logOut, data_alumno } = useContext( AuthContext );
  const [materiasAlumno, setMateriasAlumno] = useState([])
  
  const getMateriasAlumno = async () => {
    const {data} = await endeApi.get('/alu_hor',{ params: { id_alu_ram: data_alumno?.id_alu_ram } });
    if(data.trans===true){
      setMateriasAlumno(data.data);
    }
  }

  useEffect(() => {
    getMateriasAlumno();
  }, [])
  
  const dispatch = useAppDispatch();
  
  const closeSession = () => {
    dispatch(addNotifications([]))
    logOut();
  }

  return (
    <View style={[styles.drawerContainer, { backgroundColor: themeColors.background }]}>
      <DrawerContentScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER PROFILE */}
        <View style={[styles.profileSection, { backgroundColor: themeColors.backgroundCard }]}>
          <TouchableOpacity 
            style={styles.profileContent}
            onPress={() => navigation.navigate('Cuenta')}
            activeOpacity={0.7}
          >
            {data_alumno?.fot_alu ? (
              <Image 
                source={{ uri: 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu}}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.textPrimary }]}>
                <Text style={[styles.avatarText, { color: themeColors.backgroundCard }]}>
                  {FormatNameAvatar(data_alumno?.nom_alu)}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                {data_alumno?.nom_alu}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* THEME TOGGLE BUTTON - COMO EN LOGIN */}
          <TouchableOpacity 
            style={[styles.themeToggleButton, { backgroundColor: themeColors.backgroundCard }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Icon 
              name={theme === 'dark' ? 'weather-night' : 'white-balance-sunny'} 
              size={20} 
              color={themeColors.textPrimary} 
            />
          </TouchableOpacity>
        </View>

        {/* DIVIDER */}
        <View style={[styles.divider, { backgroundColor: themeColors.borderGray }]} />

        {/* MAIN MENU */}
        <DrawerItemList {...props} />

        {/* MATERIAS SECTION */}
        {materiasAlumno.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.textTertiary }]}>
                MIS MATERIAS
              </Text>
            </View>
            {materiasAlumno.map(({nom_mat, nom_gru, id_sub_hor}) => (
              <DrawerItem
                key={nom_mat+'/'+nom_gru}
                label={`${nom_mat} / ${nom_gru}`}
                labelStyle={[styles.materiaLabel, { color: themeColors.textSecondary }]}
                icon={({ color, size }) => (
                  <Icon name="book-outline" size={20} color={themeColors.textTertiary} />
                )}
                onPress={() => navigation.navigate('Materias', {id_sub_hor, nom_mat})}
                style={styles.materiaItem}
              />
            ))}
          </>
        )}

        {/* DIVIDER */}
        <View style={[styles.divider, { backgroundColor: themeColors.borderGray }]} />

        {/* LOGOUT */}
        <DrawerItem
          label="Cerrar sesión"
          labelStyle={[styles.logoutLabel, { color: themeColors.textPrimary }]}
          icon={({ color, size }) => (
            <Icon name="logout" size={22} color={themeColors.textPrimary} />
          )}
          onPress={closeSession}
          style={styles.logoutItem}
        />
      </DrawerContentScrollView>

      {/* FOOTER */}
      <TouchableOpacity 
        onPress={() => Linking.openURL('https://www.ahjende.com')} 
        activeOpacity={0.7}
        style={[styles.footer, { 
          backgroundColor: themeColors.backgroundCard,
          borderTopColor: themeColors.borderGray 
        }]}
      >
        <Image
          source={require('../assets/ende-icon.png')}
          style={styles.footerLogo}
        />
        <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
          www.ahjende.com
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  profileSection: {
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  // THEME TOGGLE BUTTON - EXACTO COMO EN LOGIN
  themeToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  materiaItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  materiaLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  logoutItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerLogo: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});