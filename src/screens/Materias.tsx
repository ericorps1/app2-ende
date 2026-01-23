import React, {useEffect, useState} from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import endeApi from '../api/estudianteAPI';
import { LoadingScreen } from './LoadingScreen';
import { TarjetaBloque } from '../components/TarjetaBloque';
import { BloqueDataInfo } from '../interfaces/appInterfaces';
import { updateInfo } from '../features/chatBloque/dataChatSlice';
import { ChatAlumno } from '../components/ChatAlumno';
import { useAppDispatch } from '../app/hooks';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Materias = ({route}:any) => {
  const { theme, colors: themeColors } = useTheme();
  const dispatch = useAppDispatch();
  const [bloques, setBloques] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const {id_sub_hor,nom_mat} = route.params;

  const getBloques = async () => {
    setIsLoading(true);
    const {data} = await endeApi.get('/bloque', {params: {id_sub_hor}})
    setBloques(data.data);
    setIsLoading(false);
  }

  useEffect(() => {
    getBloques();
    loadDataMiniChat(id_sub_hor,nom_mat);
  }, [id_sub_hor])

  const onRefresh = async () => {
    setRefreshing(true);
    await getBloques();
    setRefreshing(false);
  };

  const loadDataMiniChat = async(id_sub_hor:number,nom_mat:string) => {
    const {data} = await endeApi.get('/sub_hor/dataProfesorxSubHor/'+id_sub_hor);
    if(data.trans){
      const dataPro = data.data[0];
      dispatch(updateInfo(
        {
          id_emp: dataPro.id_emp,
          id_pro: dataPro.id_pro,
          nom_pro: dataPro.nom_emp+' '+dataPro.app_emp+' '+dataPro.apm_emp,
          fot_emp: dataPro.fot_emp,
          tipo: dataPro.tip_emp,
          id_sub_hor,
          materia: nom_mat
        }
      ));
    }
    return true;
  }

  return (
    isLoading ? (
      <LoadingScreen/>
    ) : (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.textPrimary}
              colors={[themeColors.textPrimary]}
            />
          }
        >
          {/* HEADER */}
          <View style={[styles.header, { backgroundColor: themeColors.backgroundCard, borderBottomColor: themeColors.borderGray }]}>
            <View style={[styles.headerIcon, { backgroundColor: themeColors.backgroundGray }]}>
              <Icon name="book-open-variant" size={24} color={themeColors.textPrimary} />
            </View>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{nom_mat}</Text>
              <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
                {bloques.length} {bloques.length === 1 ? 'bloque' : 'bloques'}
              </Text>
            </View>
          </View>

          {/* BLOQUES */}
          {bloques.length > 0 ? (
            <View style={styles.bloquesSection}>
              {bloques
                .sort((a: BloqueDataInfo, b: BloqueDataInfo) => a.ord_blo - b.ord_blo)
                .map((bloque: BloqueDataInfo) => (
                  <TarjetaBloque 
                    key={bloque.id_blo} 
                    bloque_data={bloque} 
                    nom_mat={nom_mat}
                  />
                ))
              }
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="book-outline" size={64} color={themeColors.borderGray} />
              <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>No hay bloques disponibles</Text>
              <Text style={[styles.emptyStateSubtext, { color: themeColors.textTertiary }]}>Los contenidos aparecerán aquí</Text>
            </View>
          )}
        </ScrollView>

        {/* MINI CHAT */}
        <View style={styles.chatContainer}>
          <ChatAlumno/>
        </View>
      </View>
    )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  bloquesSection: {
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: 20,
  },
});