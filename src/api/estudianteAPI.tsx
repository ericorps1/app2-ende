import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const endeApi = axios.create({
  baseURL: 'https://plataforma.ahjende.com/api/alumno',
  timeout: 30000,
});

// 🔥 Asegúrate de que el token se setea correctamente
endeApi.interceptors.request.use(
  async (config) => {
    // Obtener token del storage o context
    const token = await AsyncStorage.getItem('token'); // o como lo manejes
    if (token) {
      config.headers['token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default endeApi;