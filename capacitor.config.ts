import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:   'com.meresimistudios.htn',
  appName: 'HTN',
  webDir:  'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.supabase.co',
      'maps.googleapis.com',
      'maps.gstatic.com',
      '*.googleapis.com',
    ],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      permissions: { ios: 'always' },
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0A0C0F',
    },
  },
  android: {
    backgroundColor: '#0A0C0F',
  },
  ios: {
    backgroundColor: '#0A0C0F',
    contentInset:    'always',
  },
}

export default config
