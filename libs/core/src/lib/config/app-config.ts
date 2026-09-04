export interface AppConfig {
  apiUrl: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

const runtimeConfig = window.__APP_CONFIG__ ?? {};

export const appConfig: AppConfig = {
  apiUrl: runtimeConfig.apiUrl ?? 'http://localhost:3000/api/v1',
};
