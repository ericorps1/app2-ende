import RNFetchBlob from 'rn-fetch-blob';
import endeApi from '../api/estudianteAPI';

export const useUploads = async (endpoint: string, file: any, additionalData: any, authToken: string) => {
  try {
    if (!file.uri) {
      throw new Error('El archivo no tiene un URI válido');
    }
    
    // Obtener configuración del API
    const baseURL = endeApi.defaults.baseURL || 'https://plataforma.ahjende.com/api/alumno';
    const fullURL = baseURL + endpoint;
    
    // 🔥 Obtener token correctamente
    let token = authToken || endeApi.defaults.headers.common['token'] || '';
    
    // Si no está en defaults, intentar obtenerlo de otra forma
    if (!token && endeApi.defaults.headers) {
      token = endeApi.defaults.headers['token'] || '';
    }
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }
    
    // Limpiar URI
    let filePath = file.uri;
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file://', '');
    }
    
    // Verificar que el archivo existe
    const exists = await RNFetchBlob.fs.exists(filePath);
    
    if (!exists) {
      throw new Error(`El archivo no existe en: ${filePath}`);
    }
    
    // 🔥 Obtener información del archivo
    const stat = await RNFetchBlob.fs.stat(filePath);
    
    // Preparar FormData para RNFetchBlob
    const formData: any[] = [
      {
        name: 'file',
        filename: file.fileName || file.name || 'file',
        type: file.type || 'application/octet-stream',
        data: RNFetchBlob.wrap(filePath),
      }
    ];
    
    // Agregar datos adicionales
    Object.keys(additionalData).forEach(key => {
      formData.push({
        name: key,
        data: String(additionalData[key]),
      });
    });
    
    // Hacer la petición
    const response = await RNFetchBlob.config({
      timeout: 120000,
    }).fetch(
      'POST',
      fullURL,
      {
        'Content-Type': 'multipart/form-data',
        'token': String(token),
      },
      formData
    );
    
    const statusCode = response.info().status;
    const headers = response.info().headers;
    
    let data;
    try {
      const responseText = await response.text();
      
      data = JSON.parse(responseText);
    } catch (e) {
      const text = await response.text();
      console.log('⚠️ No se pudo parsear JSON, respuesta como texto:', text);
      data = { trans: false, msg: text };
    }
        
    if (statusCode >= 200 && statusCode < 300) {
      return data;
    } else {
      throw {
        response: {
          status: statusCode,
          data,
          headers,
        },
      };
    }
    
  } catch (error: any) {
    console.error('═══════════════════════════════════');
    console.error('❌ ERROR EN useUploads');
    console.error('═══════════════════════════════════');
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('📥 Server Error:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
    }
    
    console.error('═══════════════════════════════════\n');
    
    throw error;
  }
};