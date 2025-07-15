import React, { useContext } from 'react'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Cuenta } from '../screens/Cuenta';
import { Home } from '../screens/Home';
import { Materias } from '../screens/Materias';
import { Mensajes } from '../screens/Mensajes';
import { Pagos } from '../screens/Pagos';
import { AuthContext } from '../context/AuthContext';


const Drawer = createDrawerNavigator();


export default function MenuNavigatorOriginal() {

  const { logOut } = useContext( AuthContext );

  function CustomDrawerContent(props:any) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem label="Cerrar sesión" onPress={ logOut } />
      </DrawerContentScrollView>
    );
  }


  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      
      <Drawer.Screen
        name="Inicio"
        component={Home}
        
      />
      <Drawer.Screen
        name="Pagos"
        component={Pagos}
      />

      <Drawer.Screen
        name="Materias"
        component={Materias}
      />

      <Drawer.Screen
        name="Mensajes"
        component={Mensajes}
      />
      
      <Drawer.Screen
        name="Cuenta"
        component={Cuenta}
      />

    </Drawer.Navigator>
  );
}