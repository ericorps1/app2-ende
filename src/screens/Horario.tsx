import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Text, RefreshControl, TouchableOpacity, Modal, Image } from 'react-native'
import { AuthContext } from '../context/AuthContext';
import endeApi from '../api/estudianteAPI';
import { LoadingScreen } from '../screens/LoadingScreen';
import { formatDate } from '../hooks/useFormats';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Horario = () => {
  const { data_alumno } = useContext( AuthContext );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [horario, setHorario] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);

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

  if(loading) {
    return <LoadingScreen text='Cargando horario...' />
  }

  if(horario.length === 0) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={['#000']}
          />
        }
      >
        <Icon name="calendar-blank-outline" size={64} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Sin horario asignado</Text>
        <Text style={styles.emptySubtitle}>No se encontraron clases programadas</Text>
      </ScrollView>
    );
  }

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000"
              colors={['#000']}
            />
          }
        >
          {/* PROGRESS CARD */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Progreso del ciclo</Text>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressVisual}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressCircleText}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.daysInfo}>
                  <Text style={styles.daysNumber}>{daysRemaining}</Text>
                  <Text style={styles.daysLabel}>días</Text>
                </View>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </View>

          {/* INFO CARDS */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Icon name="school-outline" size={18} color="#666" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>PROGRAMA</Text>
              <Text style={styles.infoValue}>{horario[0]?.nom_ram ?? '-'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="calendar-month" size={18} color="#666" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>CICLO</Text>
              <Text style={styles.infoValue}>{horario[0]?.nom_cic ?? '-'}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Icon name="calendar-start" size={18} color="#666" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>INICIO</Text>
              <Text style={styles.infoValue}>
                {horario[0]?.ini_cic ? formatDate(horario[0]?.ini_cic,'/') : '-'}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="calendar-end" size={18} color="#666" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>FIN</Text>
              <Text style={styles.infoValue}>
                {horario[0]?.cor_cic ? formatDate(horario[0]?.cor_cic,'/') : '-'}
              </Text>
            </View>
          </View>

          {/* CLASES SECTION */}
          <View style={styles.classesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tus materias</Text>
              <Text style={styles.sectionSubtitle}>
                {horario.length} {horario.length === 1 ? 'materia' : 'materias'} este ciclo
              </Text>
            </View>

            {horario.map((clase, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.classCard}
                activeOpacity={0.7}
                onPress={() => setSelectedClass(clase)}
              >
                <View style={styles.classContent}>
                  <View style={styles.classHeader}>
                    <View style={styles.classIcon}>
                      <Icon name="book-outline" size={20} color="#000" />
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={styles.className} numberOfLines={1}>{clase.nom_mat}</Text>
                      <Text style={styles.classCode}>
                        {clase.nom_sub_hor} · {clase.id_sub_hor}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#D0D0D0" />
                  </View>

                  <View style={styles.profesorRow}>
                    <Icon name="account-outline" size={16} color="#666" />
                    <Text style={styles.profesorText} numberOfLines={1}>
                      {clase.nom_pro} {clase.app_pro}
                    </Text>
                  </View>

                  <View style={styles.schedulePreview}>
                    <Icon name="clock-outline" size={14} color="#666" />
                    <Text style={styles.schedulePreviewText}>
                      {clase.horarios.filter((h: any) => h.ini_hor).length} {clase.horarios.filter((h: any) => h.ini_hor).length === 1 ? 'horario' : 'horarios'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* MODAL DETALLE */}
      <Modal
        visible={selectedClass !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedClass(null)}
      >
        {selectedClass && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedClass(null)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* PROFESOR HERO */}
              <View style={styles.profesorHero}>
                <View style={styles.profesorImagePlaceholder}>
                  <Icon name="account" size={40} color="#999" />
                </View>
                <Text style={styles.profesorName}>
                  {selectedClass.nom_pro} {selectedClass.app_pro}
                </Text>
                <Text style={styles.profesorRole}>Profesor</Text>
              </View>

              {/* TITLE */}
              <Text style={styles.modalTitle}>{selectedClass.nom_mat}</Text>
              
              {/* METADATA */}
              <View style={styles.metadataSection}>
                <View style={styles.metadataRow}>
                  <Icon name="identifier" size={18} color="#666" />
                  <View style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Clave grupal</Text>
                    <Text style={styles.metadataValue}>
                      {selectedClass.nom_sub_hor} · {selectedClass.id_sub_hor}
                    </Text>
                  </View>
                </View>
              </View>

              {/* HORARIOS */}
              <View style={styles.schedulesSection}>
                <Text style={styles.schedulesTitle}>Horarios de clase</Text>
                {selectedClass.horarios.map(
                  (horario: any, idx: number) =>
                    horario.ini_hor && (
                      <View key={idx} style={styles.scheduleDetailCard}>
                        <View style={styles.scheduleDetailDay}>
                          <Text style={styles.scheduleDetailDayText}>
                            {horario.dia_hor}
                          </Text>
                        </View>
                        <View style={styles.scheduleDetailTime}>
                          <Icon name="clock-outline" size={16} color="#666" />
                          <Text style={styles.scheduleDetailTimeText}>
                            {horario.ini_hor} - {horario.fin_hor}
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
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // PROGRESS CARD
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  progressVisual: {
    alignItems: 'center',
    gap: 6,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#34C759',
  },
  progressCircleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34C759',
  },
  daysInfo: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  daysLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  // INFO CARDS
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  // CLASSES SECTION
  classesSection: {
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  classCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  classContent: {
    padding: 16,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  classCode: {
    fontSize: 13,
    color: '#666',
  },
  profesorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  profesorText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  schedulePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  schedulePreviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  // MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderSpacer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profesorHero: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  profesorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profesorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  profesorRole: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  metadataSection: {
    marginBottom: 32,
    gap: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataText: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  schedulesSection: {
    marginBottom: 40,
  },
  schedulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  scheduleDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleDetailDay: {
    minWidth: 80,
  },
  scheduleDetailDayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  scheduleDetailTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  scheduleDetailTimeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});