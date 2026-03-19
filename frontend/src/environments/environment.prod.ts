export const environment = {
  production: true,
  apiUrl: (window as any).__APP_CONFIG__?.apiUrl || '/api'
};
