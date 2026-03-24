import axios, { AxiosInstance } from 'axios';

class FCMTokenRepositoryImpl {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`,
      headers: { 'Content-Type': 'application/json' },
    });

    // Add JWT token to all requests
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Register FCM token with backend
   */
  async registerToken(token: string, deviceInfo?: string): Promise<void> {
    await this.client.post('/fcm-token', {
      token,
      deviceInfo: deviceInfo || navigator.userAgent,
    });
  }

  /**
   * Delete FCM token from backend
   */
  async deleteToken(token: string): Promise<void> {
    await this.client.delete('/fcm-token', {
      data: { token },
    });
  }
}

export const FCMTokenRepository = new FCMTokenRepositoryImpl();
