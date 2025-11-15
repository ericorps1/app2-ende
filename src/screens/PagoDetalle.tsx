import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react'
import { colors } from '../theme/platformTheme';
import { Pagos } from '../interfaces/appInterfaces';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentStripe } from '../components/PaymentStripe';
import RenderPdf from '../components/RenderUrlPdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PropsPagoDetalle {
  route: {
    params: Pagos
  },
  navigation: any
}

export default function PagoDetalle({ route, navigation }: PropsPagoDetalle) {
  const { top } = useSafeAreaInsets();
  const data_pagos = route.params;
  const { est_pag, mon_ori_pag, mon_pag, tip_pag, fec_pag, fin_pag } = data_pagos;
  const [paid, setPaid] = useState(data_pagos.est_pag === 'Pagado')
  const [payStatus, setPayStatus] = useState(est_pag)
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const isVencido = !paid && fin_pag && new Date(fin_pag) < new Date();

  const getTipoPago = () => {
    return tip_pag === 'Otros' ? 'Trámite' : tip_pag;
  };

  const getStatusColor = () => {
    if (paid) return '#28A745';
    if (isVencido) return '#DC3545';
    return '#FFC107';
  };

  const getStatusIcon = () => {
    if (paid) return 'check-circle';
    if (isVencido) return 'alert-circle';
    return 'clock-outline';
  };

  const getStatusText = () => {
    if (paid) return 'Pagado';
    if (isVencido) return 'Vencido';
    return 'Pendiente';
  };

  useEffect(() => {
    navigation.setOptions({
      title: data_pagos.con_pag,
      headerStyle: {
        backgroundColor: '#FFF',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '700',
      },
    })
  }, []);

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* BACK BUTTON */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.pop()}
        activeOpacity={0.7}
      >
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{data_pagos.con_pag}</Text>
        <Text style={styles.headerSubtitle}>Detalle del pago</Text>
      </View>

      {/* STATUS BADGE */}
      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
        <Icon name={getStatusIcon()} size={20} color={getStatusColor()} />
        <Text style={[styles.statusBadgeText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {/* ALERTA VENCIDO */}
      {isVencido && (
        <View style={styles.alertBanner}>
          <Icon name="alert" size={18} color="#E65100" />
          <Text style={styles.alertBannerText}>
            Este pago está vencido. Regulariza tu situación para evitar el bloqueo de tu acceso.
          </Text>
        </View>
      )}

      {/* AMOUNT CARD */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Monto a pagar</Text>
        <Text style={styles.amount}>
          <FormatAmount amount={paid ? mon_ori_pag : mon_pag} />
        </Text>
      </View>

      {/* DETAILS CARD */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Información del pago</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Icon name="shape" size={16} color="#666" />
            <Text style={styles.detailLabelText}>Tipo de pago</Text>
          </View>
          <Text style={styles.detailValue}>{getTipoPago()}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.detailLabelText}>Fecha de emisión</Text>
          </View>
          <Text style={styles.detailValue}>{formatDate(fec_pag)}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Icon name="calendar-alert" size={16} color="#666" />
            <Text style={styles.detailLabelText}>Fecha límite</Text>
          </View>
          <Text style={[styles.detailValue, isVencido && styles.detailValueVencido]}>
            {formatDate(fin_pag)}
          </Text>
        </View>
      </View>

      {/* PAYMENT BUTTON */}
      {!paid && (
        <View style={styles.paymentSection}>
          <PaymentStripe 
            data_pagos={data_pagos} 
            onPaySuccess={async () => { 
              await setPaid(true); 
              await setPayStatus('Pagado')
            }}
          />
        </View>
      )}

      {/* PDF TICKET */}
      {payStatus === 'Pagado' && (
        <RenderPdf
          title="Ticket de pago"
          patterScrollEnabled={setScrollEnabled}
          pdfUrl={`https://plataforma.ahjende.com/ticket_pago.php?id_pag=${data_pagos.id_pag}`}
          patterStyle={styles.pdfContainer}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6D00',
    marginBottom: 20,
    gap: 12,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    fontWeight: '600',
  },
  amountCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
  },
  detailsCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailLabelText: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  detailValueVencido: {
    color: '#DC3545',
  },
  paymentSection: {
    marginBottom: 20,
  },
  pdfContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
  },
});