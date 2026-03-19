export const environment = {
  production: false,
  apiUrl: (window as any).__APP_CONFIG__?.apiUrl || '/api'
};
