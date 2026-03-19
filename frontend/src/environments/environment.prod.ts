export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).__APP_CONFIG__?.apiUrl) 
    || globalThis['__APP_CONFIG__']?.apiUrl 
    || process.env['NG_APP_API_URL'] 
    || '/api'
};
