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

const Drawer = createDrawerNavigator();

export default function MenuNavigator() {
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
            drawerActiveBackgroundColor: '#000',
            drawerActiveTintColor: '#FFF',
            drawerInactiveTintColor: '#666',
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
              backgroundColor: '#FFF',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#F0F0F0',
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '700',
              color: '#000',
            },
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
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER PROFILE */}
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => navigation.navigate('Cuenta')}
          activeOpacity={0.7}
        >
          <View style={styles.profileContent}>
            {data_alumno?.fot_alu ? (
              <Image 
                source={{ uri: 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu}}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {FormatNameAvatar(data_alumno?.nom_alu)}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={2}>
                {data_alumno?.nom_alu}
              </Text>
              <View style={styles.profileBadge}>
                <Icon name="chevron-right" size={16} color="#999" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* MAIN MENU */}
        <DrawerItemList {...props} />

        {/* MATERIAS SECTION */}
        {materiasAlumno.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MIS MATERIAS</Text>
            </View>
            {materiasAlumno.map(({nom_mat, nom_gru, id_sub_hor}) => (
              <DrawerItem
                key={nom_mat+'/'+nom_gru}
                label={`${nom_mat} / ${nom_gru}`}
                labelStyle={styles.materiaLabel}
                icon={({ color, size }) => (
                  <Icon name="book-outline" size={20} color="#999" />
                )}
                onPress={() => navigation.navigate('Materias', {id_sub_hor, nom_mat})}
                style={styles.materiaItem}
              />
            ))}
          </>
        )}

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* LOGOUT */}
        <DrawerItem
          label="Cerrar sesión"
          labelStyle={styles.logoutLabel}
          icon={({ color, size }) => (
            <Icon name="logout" size={22} color="#E53935" />
          )}
          onPress={closeSession}
          style={styles.logoutItem}
        />
      </DrawerContentScrollView>

      {/* FOOTER */}
      <TouchableOpacity 
        onPress={() => Linking.openURL('https://www.ahjende.com')} 
        activeOpacity={0.7}
        style={styles.footer}
      >
        <Image
          source={require('../assets/ende-icon.png')}
          style={styles.footerLogo}
        />
        <Text style={styles.footerText}>www.ahjende.com</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  profileSection: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  profileBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
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
    color: '#999',
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
    color: '#666',
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
    color: '#E53935',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  footerLogo: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
});