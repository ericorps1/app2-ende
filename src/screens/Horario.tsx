import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Text, RefreshControl, TouchableOpacity, Modal } from 'react-native'
import { AuthContext } from '../context/AuthContext';
import endeApi from '../api/estudianteAPI';
import { LoadingScreen } from '../screens/LoadingScreen';
import { formatDate } from '../hooks/useFormats';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

export const Horario = () => {
  const { colors: themeColors } = useTheme();
  const { data_alumno } = useContext( AuthContext );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [horario, setHorario] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  // Detectar tema oscuro
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    return bg === '#000' || 
           bg === '#000000' ||
           bg === '#121212' || 
           bg === '#1a1a1a' ||
           cardBg === '#000' ||
           cardBg === '#000000' ||
           cardBg === '#121212' ||
           cardBg === '#1e1e1e' ||
           cardBg === '#1a1a1a' ||
           textPrimary === '#fff' ||
           textPrimary === '#ffffff' ||
           textPrimary === '#f5f5f5';
  })();

  useEffect(() => {
    getHorario();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getHorario();
    setRefreshing(false);
  };
  
  const getHorario = async() => {
    setLoading(true);
    const {data} = await endeApi.get('/horario', { params: { id_alu_ram: data_alumno?.id_alu_ram } });
    if(data.data) {
      setHorario(data.data);
    }
    setLoading(false);
  }

  const calculateProgress = () => {
    if (!horario[0]?.ini_cic || !horario[0]?.cor_cic) return 0;
    const inicio = new Date(horario[0].ini_cic).getTime();
    const fin = new Date(horario[0].cor_cic).getTime();
    const ahora = new Date().getTime();
    const progreso = ((ahora - inicio) / (fin - inicio)) * 100;
    return Math.max(0, Math.min(100, progreso));
  };

  const getDaysRemaining = () => {
    if (!horario[0]?.cor_cic) return 0;
    const fin = new Date(horario[0].cor_cic).getTime();
    const ahora = new Date().getTime();
    const dias = Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24));
    return Math.max(0, dias);
  };

  const getProgressColor = () => {
    const prog = calculateProgress();
    if (isDarkTheme) {
      if (prog >= 75) return '#D0A8A0'; // Rosa pastel apagado
      if (prog >= 50) return '#D4BDA0'; // Naranja pastel apagado
      if (prog >= 25) return '#A8C5D0'; // Azul pastel apagado
      return '#A8C4A8'; // Verde pastel apagado
    } else {
      if (prog >= 75) return '#FF6B6B';
      if (prog >= 50) return '#FFA726';
      if (prog >= 25) return '#42A5F5';
      return '#34C759';
    }
  };

  const getSubjectColors = (index: number) => {
    if (isDarkTheme) {
      // Paleta pastel apagada para modo oscuro
      const colors = [
        { bg: '#2A2F35', icon: '#9DB4C8' },  // Azul grisáceo
        { bg: '#352F2A', icon: '#D4BDA0' },  // Naranja grisáceo
        { bg: '#2F2A35', icon: '#C4ADC8' },  // Morado grisáceo
        { bg: '#2D352E', icon: '#A8C4A8' },  // Verde grisáceo
        { bg: '#382E2D', icon: '#D0A8A0' },  // Rosa grisáceo
        { bg: '#2E3532', icon: '#A8C4B8' },  // Turquesa grisáceo
      ];
      return colors[index % colors.length];
    } else {
      const colors = [
        { bg: '#E3F2FD', icon: '#1976D2' },
        { bg: '#FFF3E0', icon: '#F57C00' },
        { bg: '#F3E5F5', icon: '#7B1FA2' },
        { bg: '#E8F5E9', icon: '#34C759' },
        { bg: '#FFE0E0', icon: '#D32F2F' },
        { bg: '#E0F7FA', icon: '#00ACC1' },
      ];
      return colors[index % colors.length];
    }
  };

  if(loading) {
    return <LoadingScreen text='Cargando horario...' />
  }

  if(horario.length === 0) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.textPrimary}
            colors={[themeColors.textPrimary]}
          />
        }
      >
        <View style={[
          styles.emptyIconContainer,
          { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
        ]}>
          <Icon name="calendar-blank-outline" size={48} color={themeColors.textTertiary} />
        </View>
        <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>Sin horario asignado</Text>
        <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
          No se encontraron clases programadas
        </Text>
      </ScrollView>
    );
  }

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();
  const progressColor = getProgressColor();

  return (
    <>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.textPrimary}
              colors={[themeColors.textPrimary]}
            />
          }
        >
          {/* Tarjeta de progreso mejorada */}
          <View style={[
            styles.progressCard, 
            { 
              backgroundColor: themeColors.backgroundCard,
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
            }
          ]}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
                  Progreso del ciclo
                </Text>
                <Text style={[styles.progressPercentage, { color: progressColor }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View style={styles.progressVisual}>
                <View style={[
                  styles.progressCircle,
                  { 
                    backgroundColor: isDarkTheme ? '#2A2A2A' : `${progressColor}15`,
                    borderColor: progressColor 
                  }
                ]}>
                  <Text style={[styles.progressCircleText, { color: progressColor }]}>
                    {Math.round(progress)}%
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBarBg, 
                { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.borderGray }
              ]}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
              </View>
            </View>
            <View style={styles.daysRemainingRow}>
              <Icon name="calendar-clock" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.daysRemainingText, { color: themeColors.textSecondary }]}>
                {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
              </Text>
            </View>
          </View>

          {/* Información del programa en grid mejorado */}
          <View style={styles.infoGrid}>
            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
              }
            ]}>
              <View style={[
                styles.infoIconContainer,
                { backgroundColor: isDarkTheme ? '#2A2F35' : '#E3F2FD' }
              ]}>
                <Icon name="school-outline" size={20} color={isDarkTheme ? '#9DB4C8' : '#1976D2'} />
              </View>
              <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Programa</Text>
              <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={2}>
                {horario[0]?.nom_ram ?? '-'}
              </Text>
            </View>

            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
              }
            ]}>
              <View style={[
                styles.infoIconContainer,
                { backgroundColor: isDarkTheme ? '#352F2A' : '#FFF3E0' }
              ]}>
                <Icon name="calendar-month" size={20} color={isDarkTheme ? '#D4BDA0' : '#F57C00'} />
              </View>
              <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Ciclo</Text>
              <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={2}>
                {horario[0]?.nom_cic ?? '-'}
              </Text>
            </View>

            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
              }
            ]}>
              <View style={[
                styles.infoIconContainer,
                { backgroundColor: isDarkTheme ? '#2D352E' : '#E8F5E9' }
              ]}>
                <Icon name="calendar-start" size={20} color={isDarkTheme ? '#A8C4A8' : '#34C759'} />
              </View>
              <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Inicio</Text>
              <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
                {horario[0]?.ini_cic ? formatDate(horario[0]?.ini_cic,'/') : '-'}
              </Text>
            </View>

            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
              }
            ]}>
              <View style={[
                styles.infoIconContainer,
                { backgroundColor: isDarkTheme ? '#382E2D' : '#FFE0E0' }
              ]}>
                <Icon name="calendar-end" size={20} color={isDarkTheme ? '#D0A8A0' : '#D32F2F'} />
              </View>
              <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Fin</Text>
              <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
                {horario[0]?.cor_cic ? formatDate(horario[0]?.cor_cic,'/') : '-'}
              </Text>
            </View>
          </View>

          {/* Sección de materias mejorada */}
          <View style={styles.classesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                Tus materias
              </Text>
              <View style={[
                styles.countBadge,
                { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
              ]}>
                <Text style={[styles.countBadgeText, { color: themeColors.textPrimary }]}>
                  {horario.length}
                </Text>
              </View>
            </View>

            {horario.map((clase, index) => {
              const colors = getSubjectColors(index);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.classCard, 
                    { 
                      backgroundColor: themeColors.backgroundCard,
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                    }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedClass(clase)}
                >
                  <View style={styles.classCardContent}>
                    <View style={[styles.classIconLarge, { backgroundColor: colors.bg }]}>
                      <Icon name="book-open-variant" size={24} color={colors.icon} />
                    </View>
                    
                    <View style={styles.classDetails}>
                      <Text style={[styles.className, { color: themeColors.textPrimary }]} numberOfLines={2}>
                        {clase.nom_mat}
                      </Text>
                      
                      <View style={styles.classMetaRow}>
                        <View style={styles.classMetaItem}>
                          <Icon name="account-outline" size={14} color={themeColors.textTertiary} />
                          <Text style={[styles.classMetaText, { color: themeColors.textSecondary }]} numberOfLines={1}>
                            {clase.nom_pro}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.classFooter}>
                        <View style={[
                          styles.scheduleChip,
                          { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
                        ]}>
                          <Icon name="clock-outline" size={12} color={themeColors.textTertiary} />
                          <Text style={[styles.scheduleChipText, { color: themeColors.textSecondary }]}>
                            {clase.horarios.filter((h: any) => h.ini_hor).length} {clase.horarios.filter((h: any) => h.ini_hor).length === 1 ? 'horario' : 'horarios'}
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={themeColors.borderGray} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Modal mejorado */}
      <Modal
        visible={selectedClass !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedClass(null)}
      >
        {selectedClass && (
          <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
            <View style={[
              styles.modalHeader, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.closeButton, 
                  { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
                ]}
                onPress={() => setSelectedClass(null)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={22} color={themeColors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.modalHeaderTitle, { color: themeColors.textPrimary }]}>
                Detalle de materia
              </Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContentContainer}
            >
              {/* Hero section con diseño mejorado */}
              <View style={[
                styles.modalHeroCard,
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                }
              ]}>
                <View style={[
                  styles.profesorImageLarge,
                  { backgroundColor: isDarkTheme ? '#2A2F35' : '#E3F2FD' }
                ]}>
                  <Icon name="account" size={48} color={isDarkTheme ? '#9DB4C8' : '#1976D2'} />
                </View>
                <Text style={[styles.profesorNameLarge, { color: themeColors.textPrimary }]}>
                  {selectedClass.nom_pro} {selectedClass.app_pro}
                </Text>
                <View style={[
                  styles.roleBadge,
                  { backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray }
                ]}>
                  <Icon name="briefcase-outline" size={14} color={themeColors.textSecondary} />
                  <Text style={[styles.roleBadgeText, { color: themeColors.textSecondary }]}>
                    Profesor
                  </Text>
                </View>
              </View>

              {/* Nombre de la materia */}
              <View style={[
                styles.subjectNameCard,
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                }
              ]}>
                <Icon name="book-open-page-variant" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.subjectNameText, { color: themeColors.textPrimary }]}>
                  {selectedClass.nom_mat}
                </Text>
              </View>

              {/* Metadata */}
              <View style={[
                styles.metadataCard,
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                }
              ]}>
                <View style={styles.metadataItem}>
                  <View style={[
                    styles.metadataIcon,
                    { backgroundColor: isDarkTheme ? '#2F2A35' : '#F3E5F5' }
                  ]}>
                    <Icon name="identifier" size={16} color={isDarkTheme ? '#C4ADC8' : '#7B1FA2'} />
                  </View>
                  <View style={styles.metadataContent}>
                    <Text style={[styles.metadataLabel, { color: themeColors.textTertiary }]}>
                      Clave grupal
                    </Text>
                    <Text style={[styles.metadataValue, { color: themeColors.textPrimary }]}>
                      {selectedClass.nom_sub_hor} · {selectedClass.id_sub_hor}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Horarios */}
              <View style={styles.schedulesSection}>
                <Text style={[styles.schedulesSectionTitle, { color: themeColors.textPrimary }]}>
                  Horarios de clase
                </Text>
                {selectedClass.horarios.map(
                  (horario: any, idx: number) =>
                    horario.ini_hor && (
                      <View 
                        key={idx} 
                        style={[
                          styles.scheduleCard, 
                          { 
                            backgroundColor: themeColors.backgroundCard,
                            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                          }
                        ]}
                      >
                        <View style={[
                          styles.scheduleDayBadge,
                          { backgroundColor: isDarkTheme ? '#2A2F35' : '#E3F2FD' }
                        ]}>
                          <Text style={[
                            styles.scheduleDayText, 
                            { color: isDarkTheme ? '#9DB4C8' : '#1976D2' }
                          ]}>
                            {horario.dia_hor}
                          </Text>
                        </View>
                        <View style={styles.scheduleTimeContainer}>
                          <Icon name="clock-time-four-outline" size={16} color={themeColors.textSecondary} />
                          <Text style={[styles.scheduleTimeText, { color: themeColors.textPrimary }]}>
                            {horario.ini_hor}
                          </Text>
                          <Icon name="arrow-right" size={14} color={themeColors.textTertiary} />
                          <Text style={[styles.scheduleTimeText, { color: themeColors.textPrimary }]}>
                            {horario.fin_hor}
                          </Text>
                        </View>
                      </View>
                    )
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: '700',
  },
  progressVisual: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  progressCircleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  daysRemainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  daysRemainingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  classesSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  classCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
  },
  classCardContent: {
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  classIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  classMetaRow: {
    gap: 6,
    marginBottom: 10,
  },
  classMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classMetaText: {
    fontSize: 13,
    flex: 1,
  },
  classFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scheduleChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  modalHeroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
  },
  profesorImageLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profesorNameLarge: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subjectNameCard: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  subjectNameText: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  metadataCard: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadataContent: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  schedulesSection: {
    marginBottom: 20,
  },
  schedulesSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    gap: 14,
  },
  scheduleDayBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  scheduleDayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scheduleTimeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleTimeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});