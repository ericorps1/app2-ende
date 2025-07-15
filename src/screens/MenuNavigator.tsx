import React, { useContext, useEffect, useState } from 'react'
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
// import { Cuenta } from '../screens/Cuenta';
import { Home } from '../screens/Home';
import { Materias } from '../screens/Materias';
import { Mensajes } from '../screens/Mensajes';
import { Pagos } from '../screens/Pagos';
import { AuthContext } from '../context/AuthContext';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import { platformTheme, colors } from '../theme/platformTheme';
import { Avatar, Button } from 'react-native-paper';
import { FormatNameAvatar } from '../hooks/useFormats';
import endeApi from '../api/estudianteAPI';
import PaperMessages from '../components/PaperMessages';
import { Actividades } from '../screens/Actividades';
// import { Calificaciones } from '../screens/Calificaciones';
import { HeaderRight } from '../components/HeaderRight';


const Drawer = createDrawerNavigator();


export default function MenuNavigator() {
  const { data_alumno, logOut } = useContext( AuthContext );
  const [pagosVencidos, setPagosVencidos] = useState(false);
  
  const getPagosVencidos = async () => {
    const { data } = await endeApi.get('/pagos_vencidos/'+data_alumno?.id_alu_ram);
    if(data.trans===true){
        if(data.data.length>0){//si hay pagos vencidos se setea a true para mostrar el modal
          console.log('Pagos vencidos: ',data.data);  
          setPagosVencidos(true);
        }
    }
  }

  useEffect(() => {
      getPagosVencidos();
  }, [])
    return (
      (pagosVencidos) ?
        <PaperMessages
          visible={true}
          title='Pagos vencidos'
          message='Actualmente presenta pagos vencidos, por favor, póngase al día para poder seguir utilizando la aplicación.'
          buttonText='ACEPTAR'
          dismissable={false}
          colorTitle={colors.danger}
          colorBody={colors.darkBlue}
          pressButton = { () => {setPagosVencidos(false)} }
        />
        :
        <Drawer.Navigator
          drawerContent={ (props:any) => <ContenidoMenu { ...props }/> }
          screenOptions={{
            // drawerStyle: {
            //   backgroundColor: colors.softBlue,
            //   // width: '60%',
            // },
            drawerActiveBackgroundColor: colors.primary,
            drawerActiveTintColor: 'white',
            headerRight: () => (
              <HeaderRight/>
            ),
          }}
        >
          <Drawer.Screen name="Inicio" component={Home} />
          <Drawer.Screen name="Pagos" component={Pagos} />
          <Drawer.Screen name="Mensajes" component={Mensajes} />
          <Drawer.Screen name="Actividades" component={Actividades} />
          {/*<Drawer.Screen name="Calificaciones" component={Calificaciones} />
          <Drawer.Screen name="Cuenta" component={Cuenta} options={{drawerItemStyle:{display: 'none'}}}/> */}
          <Drawer.Screen name="Materias" component={Materias} options={{drawerItemStyle:{display: 'none'}}}/>
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

  return (
    <DrawerContentScrollView>
      <TouchableOpacity 
        style={ platformTheme.avatarContent }
        onPress={ () => navigation.navigate('Cuenta') }
      >
        { (data_alumno?.fot_alu) 
          ? (
            <Image 
                source={{ uri: 'https://plataforma.ahjende.com/uploads/'+data_alumno?.fot_alu}}
                style={ platformTheme.avatar }
            />
          )
          : (
            <Avatar.Text style={ platformTheme.avatar } label={FormatNameAvatar(data_alumno?.nom_alu)} />
          )
        }
        <Text style={ platformTheme.avatarName }> { data_alumno?.nom_alu } </Text>
      </TouchableOpacity>
      <DrawerItemList {...props} />
      {
        (materiasAlumno.length>0) && (
          materiasAlumno.map(({nom_mat,nom_gru,id_sub_hor}) => {
            return (
              <DrawerItem
                key={nom_mat+'/'+nom_gru}
                label={nom_mat+'/'+nom_gru}
                onPress={()=> navigation.navigate('Materias', {id_sub_hor,nom_mat})}
              />
            )
          })
        )
      }
      <DrawerItem
        label="Cerrar sesión"
        onPress={logOut}
      />
      {/* <View style={ platformTheme.menuContainer }>
        <MenuOption texto={'Inicio'} onPress={ () => { navigation.navigate('Inicio') } } />
        <MenuOption texto={'Pagos'} onPress={ () => { navigation.navigate('Pagos') } } />
        <MenuOption texto={'Materias'} onPress={ () => { navigation.navigate('Materias') } } />
        <MenuOption texto={'Mensajes'} onPress={ () => { navigation.navigate('Mensajes') } } />
      </View> */}
    </DrawerContentScrollView>
  )
}

// const MenuOption = ({ texto, onPress, }:MenuOptions) => {
//   return (
//     <TouchableOpacity 
//       style={ platformTheme.menuBoton }
//       onPress={ onPress }
//       activeOpacity={0.1}
//     >
//       <Text style={platformTheme.menuTexto}>{ texto }</Text>
//     </TouchableOpacity>
//   )
// }