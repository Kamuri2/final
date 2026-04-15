import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // 💥 Importante para revisar la sesión
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { isDarkMode } = useTheme();
  const [isChecking, setIsChecking] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const checkNavigationFlow = async () => {
      try {
        const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
        const sessionid = await SecureStore.getItemAsync('user_session_id');

        if (hasSeenWelcome === 'true') {
          // --- FLUJO DE USUARIO RECURRENTE ---
          if (sessionid) {
            // 🔥 Tiene sesión: Mandar a confirmar identidad (Unlock)
            router.replace('/Unlock');
          } else {
            // No tiene sesión: Mandar al Login original
            router.replace('/Login');
          }
        } else {
          // --- PRIMERA VEZ EN LA APP ---
          setIsChecking(false);
          startAnimations();
        }
      } catch (error) {
        setIsChecking(false);
      }
    };

    checkNavigationFlow();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    router.replace('/Login');
  };

  if (isChecking) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: isDarkMode ? '#3D3B36' : '#F2F1EB' }}>
        <ActivityIndicator size="large" color={isDarkMode ? '#9DB08B' : '#8C977A'} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: isDarkMode ? '#262422' : '#F2F1EB' }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* CONTENEDOR SUPERIOR */}
      <View
        className="h-[55%] items-center justify-center rounded-br-[100px] shadow-2xl z-10"
        style={{ backgroundColor: isDarkMode ? '#35332F' : '#EAE9E4' }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')}
            className="w-80 h-80"
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* CONTENEDOR INFERIOR */}
      <View
        className="flex-1 -mt-10 px-10 justify-center rounded-t-[45px]"
        style={{ backgroundColor: isDarkMode ? '#262422' : '#F2F1EB' }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text className={`text-4xl font-black mb-4 text-center ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Bienvenido a <Text style={{ color: isDarkMode ? '#9DB08B' : '#8C977A' }}>QRify</Text>
          </Text>

          <Text className={`text-base text-center leading-6 mb-14 font-medium px-4 ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>
            Gestiona tus credenciales digitales de forma rápida, segura y elegante.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStart}
            className="py-5 rounded-3xl items-center shadow-2xl w-[80%] self-center"
            style={{ backgroundColor: isDarkMode ? '#9DB08B' : '#8C977A' }}
          >
            <Text className={`font-black text-lg tracking-[4px] ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>
              COMENZAR
            </Text>
          </TouchableOpacity>

          <View className="mt-10 items-center">
            <Text className={`text-[10px] font-bold tracking-[3px] uppercase opacity-60 ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-400'}`}>
              RavenID • v1.0
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}