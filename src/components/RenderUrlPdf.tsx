import React, { useState } from "react";
import { StyleSheet, View, Dimensions, Alert, Text, ActivityIndicator } from "react-native";
import Pdf from "react-native-pdf";
import { Card, Button, Surface, IconButton } from "react-native-paper";
import ReactNativeBlobUtil from "react-native-blob-util";
import { platformTheme, colors } from "../theme/platformTheme";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from "react-native-blob-util";

const { width } = Dimensions.get("window");

interface Props {
  title: string;
  pdfUrl: string;
  patterScrollEnabled: (enabled: boolean) => void;
  patterStyle?: object;
}

const RenderPdf: React.FC<Props> = ({ title, pdfUrl, patterScrollEnabled, patterStyle }) => {
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
        "✅ Descarga Completada", 
        `PDF guardado exitosamente en:\n${res.path()}`,
        [
          { text: "OK", style: "default" }
        ]
      );
    } catch (err) {
      console.log("❌ Error descargando:", err);
      Alert.alert(
        "Error de Descarga", 
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
    <View style={ patterStyle ? patterStyle : {}}>
      <Surface style={styles.headerSurface} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <View style={styles.iconTitleContainer}>
              <Icon name="file-pdf-box" size={32} color={colors.primary} />
              <View style={styles.titleTexts}>
                <Text style={styles.title}>{ title }</Text>
                <Text style={styles.subtitle}>
                  Documento PDF
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <Button
              mode="contained"
              icon={downloading ? undefined : "download"}
              onPress={handleDownload}
              style={[platformTheme.btnPrimary, styles.downloadButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              disabled={downloading || error}
              loading={downloading}
            >
              {downloading ? "Descargando..." : "Descargar"}
            </Button>
          </View>
        </View>
      </Surface>

      {/* PDF Viewer Section */}
      <Card style={styles.pdfCard} elevation={4}>
        <View style={styles.pdfContainer}>
          
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={64} color="#FF6B6B" />
              <Text style={styles.errorTitle}>Error al cargar PDF</Text>
              <Text style={styles.errorMessage}>
                No se pudo mostrar el documento. Intenta descargarlo para verlo.
              </Text>
              <Button
                mode="outlined"
                icon="refresh"
                onPress={() => {
                  setError(false);
                }}
                style={styles.retryButton}
              >
                Reintentar
              </Button>
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
              style={styles.pdf}
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
          <View style={styles.pdfFocusBadge}>
            <Icon name="gesture-swipe" size={20} color="#fff" />
            <Text style={styles.pdfFocusText}>Navegando PDF</Text>
            <Button
              mode="text"
              compact
              textColor="#fff"
              onPress={() => {
                setScale(1.0);
                setPdfFocus(false);
                patterScrollEnabled(true);
              }}
            >
              Salir <Text style={{ color: colors.danger }}>X</Text>
            </Button>
          </View>
        )}
        </View>
        <View style={styles.containerZoomBtns}>
          <Button mode="outlined" onPress={handleZoomOut}>
            ➖ Zoom
          </Button>
          <Button mode="outlined" onPress={handleZoomIn}>
            ➕ Zoom
          </Button>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSurface: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  titleTexts: {
    marginLeft: 12,
    flex: 1,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '500',
  },
  
  headerActions: {
    alignItems: 'flex-end',
  },
  
  downloadButton: {
    borderRadius: 12,
    elevation: 2,
  },
  
  buttonContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  pdfCard: {
    borderRadius: 16,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  
  pdfContainer: {
    height: 600,
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  
  pdf: {
    flex: 1,
    width: width - 32,
    backgroundColor: '#FFFFFF',
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.darkBlue,
    fontWeight: '500',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 8,
  },
  
  errorMessage: {
    fontSize: 14,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  retryButton: {
    borderColor: colors.primary,
    borderRadius: 8,
  },
  
  pageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  
  pageText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkBlue,
  },
  
  infoSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  infoText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.darkBlue,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  containerZoomBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },

  pdfFocusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },

  pdfFocusText: {
    color: "#fff",
    fontSize: 12,
    marginHorizontal: 6,
    fontWeight: "600",
  },
});

export default RenderPdf;