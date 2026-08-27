import React,{useCallback} from 'react';
import {View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {AuthProvider} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import {colors} from './src/theme';

// Spec 9.1: Cormorant Garamond for display and mark, Lora for body.
SplashScreen.preventAutoHideAsync().catch(()=>{});

export default function App(){
  const [ready]=useFonts({
    'CormorantGaramond':require('./assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Medium':require('./assets/fonts/CormorantGaramond-Medium.ttf'),
    'CormorantGaramond-SemiBold':require('./assets/fonts/CormorantGaramond-SemiBold.ttf'),
    'CormorantGaramond-Italic':require('./assets/fonts/CormorantGaramond-RegularItalic.ttf'),
    'Lora':require('./assets/fonts/Lora-Regular.ttf'),
    'Lora-Medium':require('./assets/fonts/Lora-Medium.ttf'),
    'Lora-SemiBold':require('./assets/fonts/Lora-SemiBold.ttf'),
    'Lora-RegularItalic':require('./assets/fonts/Lora-RegularItalic.ttf'),
  });

  // Hold the splash until the faces are ready, so no frame renders in a fallback font.
  const onLayout=useCallback(()=>{if(ready)SplashScreen.hideAsync().catch(()=>{})},[ready]);
  if(!ready)return null;

  return (
    <View style={{flex:1,backgroundColor:colors.cream}} onLayout={onLayout}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark"/>
          <AppNavigator/>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}
