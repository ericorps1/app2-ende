import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { AuthContext } from '../context/AuthContext';
import endeApi from '../api/estudianteAPI';
import { LoadingScreen } from '../screens/LoadingScreen';
import { Card, Title, Text, Chip, Divider, Button } from 'react-native-paper';
import { formatDate } from '../hooks/useFormats';
import { colors } from '../theme/platformTheme';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

export const Horario = () => {
  const { data_alumno } = useContext( AuthContext );
  const [loading, setLoading] = useState(true);
  const [horario, setHorario] = useState<any[]>([])
  useEffect(() => {
    getHorario();
  }, [])

  const getHorario = async() => {
    setLoading(true);
    const {data} = await endeApi.get('/horario', { params: { id_alu_ram: data_alumno?.id_alu_ram } });
    if(data.data) {
      setHorario(data.data);
    }
    setLoading(false);
  }

  if(loading) {
    return <LoadingScreen text='Cargando horario del alumno...' />
  }

  if(horario.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No se encontraron horarios para el alumno.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.header}>INFORMACIÓN ACADÉMICA</Title>

      {/* Tarjetas pequeñas */}
      <View style={styles.infoRow}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.label}>PROGRAMA</Text>
            <Text style={styles.value}>{ horario[0]?.nom_ram ?? '' }</Text>
          </Card.Content>
        </Card>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.label}>CICLO</Text>
            <Text style={styles.value}>{ horario[0]?.nom_cic ?? '' }</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.infoRow}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.label}>INICIO</Text>
            <Text style={styles.value}>{ horario[0]?.ini_cic ? formatDate(horario[0]?.ini_cic,'/') : '' }</Text>
          </Card.Content>
        </Card>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.label}>FIN</Text>
            <Text style={styles.value}>{ horario[0]?.cor_cic ? formatDate(horario[0]?.cor_cic,'/') : '' }</Text>
          </Card.Content>
        </Card>
      </View>

      <Divider style={{ marginVertical: 16 }} />

      {horario.map((clase, index) => {
        return (
          <Card key={index} style={styles.classCard}>
            <Card.Content>
              <Text style={styles.classTitle}>
                Clave grupal: {clase.nom_sub_hor} - {clase.id_sub_hor}
              </Text>
              <Text style={styles.profesor}>Profesor: {clase.nom_pro} {clase.app_pro}</Text>
              <Text style={styles.profesor}>Materia: {clase.nom_mat}</Text>
              <View style={styles.daysRow}>
                {clase.horarios.map(
                  (horario: any) =>
                    horario.ini_hor && (
                      <Chip
                        key={`${horario.dia_hor}-${horario.id_sub_hor1}`}
                        style={styles.chip}
                        icon={() => (
                          <FontAwesome5Icon name={'clock'} style={styles.icon} />
                        )}
                        textStyle={{ color: 'white' }}
                        rippleColor={'red'}
                      >
                        {horario.dia_hor}: {horario.ini_hor} - {horario.fin_hor}
                      </Chip>
                    )
                )}
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  classCard: {
    borderRadius: 12,
    marginBottom: 30,
    elevation: 3,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profesor: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: colors.primary,
    color: 'white',
  },
  icon: {
    color: 'white',
  },
});