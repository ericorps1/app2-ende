import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = 'https://plataforma.ahjende.com/api/alumno';


const endeApi = axios.create({ baseURL });

endeApi.interceptors.request.use(
    async(config) => {
        const token = await AsyncStorage.getItem('token');
        if ( token ) {
            if (!config.headers) {
                config.headers = new axios.AxiosHeaders();
            }
            config.headers['token'] = token;
        }
        return config;
    }
);



export default endeApi;