import axios from 'axios';

const baseURL = 'https://terminal.ahjende.com/api';

const stripeApi = axios.create({ baseURL });

stripeApi.interceptors.request.use(
  async(config) => {
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }
    return config;
  }
);

export default stripeApi;