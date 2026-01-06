import React, { useState } from "react";
import { StyleSheet, View, Dimensions, Alert, Text, TouchableOpacity } from "react-native";
import Pdf from "react-native-pdf";
import { ActivityIndicator } from "react-native-paper";
import ReactNativeBlobUtil from "react-native-blob-util";
import { colors } from "../theme/platformTheme";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from "react-native-blob-util";
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

const { width } = Dimensions.get("window");

interface Props {
  title: string;
  pdfUrl: string;
  patterScrollEnabled: (enabled: boolean) => void;
  patterStyle?: object;
}

const RenderPdf: React.FC<Props> = ({ title, pdfUrl, patterScrollEnabled, patterStyle }) => {
  const { colors: themeColors } = useTheme(); // 👈 HOOK
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [scale, setScale] = useState(1.0);
  const [pdfFocus, setPdfFocus] = useState(false);
  const [uriPath, setUriPath] = useState(pdfUrl);

  const handleZoomIn = () => {
    if (scale < 3.0) setScale((prev) => prev + 0.2);
  };

  const handleZoomOut = () => {
    if (scale > 0.5) setScale((prev) => prev - 0.2);
  };
  
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const { config, fs } = ReactNativeBlobUtil;
      const timestamp = Date.now();
      const path = `${fs.dirs.DownloadDir}/${title}_${timestamp}.pdf`;
      
      const res = await config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path,
          description: "Solicitud de inscripción PDF",
          mime: "application/pdf",
        },
      }).fetch("GET", pdfUrl);
      
      Alert.alert(
        "Descarga completada", 
        `PDF guardado exitosamente en:\n${res.path()}`,
        [{ text: "OK", style: "default" }]
      );
    } catch (err) {
      console.log("❌ Error descargando:", err);
      Alert.alert(
        "Error de descarga", 
        "No se pudo descargar el PDF. Inténtalo nuevamente.",
        [
          { text: "Reintentar", onPress: handleDownload },
          { text: "Cancelar", style: "cancel" }
        ]
      );
    } finally {
      setDownloading(false);
    }
  };

  const downloadAndShowFallback = () => {
    const url = pdfUrl;
    const { fs } = RNFetchBlob;
    const filePath = fs.dirs.CacheDir + "/ticket_pago.pdf";

    RNFetchBlob.config({ path: filePath })
      .fetch("GET", url)
      .then((res) => {
        setUriPath(res.path());
      })
      .catch((err) => console.log("Error descargando PDF:", err));
  };

  return (
    <View style={patterStyle ? patterStyle : styles.defaultContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.backgroundGray }]}>
            <Icon name="file-document-outline" size={24} color={themeColors.textPrimary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Documento PDF</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.downloadButton, 
            { backgroundColor: themeColors.textPrimary },
            downloading && styles.downloadButtonDisabled
          ]}
          onPress={handleDownload}
          disabled={downloading || error}
          activeOpacity={0.7}
        >
          {downloading ? (
            <ActivityIndicator size={20} color={themeColors.backgroundCard} />
          ) : (
            <Icon name="download-outline" size={20} color={themeColors.backgroundCard} />
          )}
          <Text style={[styles.downloadButtonText, { color: themeColors.backgroundCard }]}>
            {downloading ? 'Descargando...' : 'Descargar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PDF VIEWER */}
      <View style={[styles.pdfCard, { 
        backgroundColor: themeColors.backgroundCard,
        borderColor: themeColors.borderGray 
      }]}>
        <View style={[styles.pdfContainer, { backgroundColor: themeColors.backgroundGray }]}>
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: themeColors.backgroundCard }]}>
              <Icon name="alert-circle-outline" size={64} color={themeColors.textSecondary} />
              <Text style={[styles.errorTitle, { color: themeColors.textPrimary }]}>Error al cargar PDF</Text>
              <Text style={[styles.errorMessage, { color: themeColors.textSecondary }]}>
                No se pudo mostrar el documento. Intenta descargarlo para verlo.
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { borderColor: themeColors.borderGray }]}
                onPress={() => setError(false)}
              >
                <Icon name="refresh" size={18} color={themeColors.textPrimary} />
                <Text style={[styles.retryButtonText, { color: themeColors.textPrimary }]}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!error && (
            <Pdf
              source={{ 
                uri: uriPath, 
                cache: true,
                headers: {
                  'Accept': 'application/pdf',
                  'Cache-Control': 'no-cache'
                }
              }}
              style={[styles.pdf, { backgroundColor: themeColors.backgroundCard }]}
              spacing={10}
              password=""
              scale={scale}
              minScale={0.5}
              maxScale={3.0}
              horizontal={false}
              page={1}
              enablePaging={true}
              enableRTL={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={true}
              onPageSingleTap={() => {
                setPdfFocus(true);
                patterScrollEnabled(false);
              }}
              onScaleChanged={(newScale) => {
                if (newScale > 1.0) {
                  setPdfFocus(true);
                  patterScrollEnabled(false);
                } else {
                  setPdfFocus(false);
                  patterScrollEnabled(true);
                }
              }}
              onError={(error) => {
                downloadAndShowFallback();
              }}
              onLoadComplete={(pages) => console.log("PDF cargado:", pages, "páginas")}
            />
          )}

          {pdfFocus && (
            <View style={styles.focusBadge}>
              <Icon name="gesture-swipe" size={16} color="#FFF" />
              <Text style={styles.focusBadgeText}>Navegando PDF</Text>
              <TouchableOpacity
                onPress={() => {
                  setScale(1.0);
                  setPdfFocus(false);
                  patterScrollEnabled(true);
                }}
                style={styles.focusBadgeClose}
              >
                <Icon name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ZOOM CONTROLS */}
        <View style={[styles.zoomControls, { 
          backgroundColor: themeColors.backgroundCard,
          borderTopColor: themeColors.borderGray 
        }]}>
          <TouchableOpacity 
            style={[styles.zoomButton, { borderColor: themeColors.borderGray }]}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Icon name="minus" size={18} color={themeColors.textPrimary} />
            <Text style={[styles.zoomButtonText, { color: themeColors.textPrimary }]}>Zoom</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.zoomButton, { borderColor: themeColors.borderGray }]}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Icon name="plus" size={18} color={themeColors.textPrimary} />
            <Text style={[styles.zoomButtonText, { color: themeColors.textPrimary }]}>Zoom</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pdfCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pdfContainer: {
    height: 600,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: width - 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  focusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  focusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  focusBadgeClose: {
    marginLeft: 8,
    padding: 2,
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  zoomButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RenderPdf;