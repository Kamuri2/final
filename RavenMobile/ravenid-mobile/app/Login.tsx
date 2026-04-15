import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
    }
  }
`;

// --- DICCIONARIO DE IDIOMAS ---
const i18n = {
    es: {
        titulo: "INICIAR SESIÓN",
        usuario: "USUARIO",
        pass: "CONTRASEÑA",
        placeholderUser: "Ingresa tu usuario",
        placeholderPass: "••••••••",
        olvido: "¿Olvidó su contraseña?",
        recuperar: "Recuperar",
        loginBtn: "ACCEDER",
        noCuenta: "¿No tienes una cuenta?",
        registro: "Regístrate",
        errorDatos: "INGRESA TUS DATOS",
        errorServer: "DATOS INCORRECTOS",
        exitoLogin: "ACCESO CONCEDIDO"
    },
    en: {
        titulo: "LOGIN",
        usuario: "USERNAME",
        pass: "PASSWORD",
        placeholderUser: "Enter your username",
        placeholderPass: "••••••••",
        olvido: "Forgot your password?",
        recuperar: "Recover",
        loginBtn: "Log In",
        noCuenta: "Don't have an account?",
        registro: "Sign Up",
        errorDatos: "ENTER YOUR DATA",
        errorServer: "INVALID CREDENTIALS",
        exitoLogin: "ACCESS GRANTED"
    }
};

export default function LoginScreen() {
    const { isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    // ESTADO PARA IDIOMA
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const t = i18n[lang];

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const sheetAnim = useRef(new Animated.Value(height)).current;

    // HOOK PARA EL IDIOMA
    useFocusEffect(
        useCallback(() => {
            const loadLanguage = async () => {
                try {
                    const savedLang = await AsyncStorage.getItem('app_language');
                    if (savedLang === 'en' || savedLang === 'es') {
                        setLang(savedLang);
                    }
                } catch (e) {
                    console.log("Error cargando idioma en Login:", e);
                }
            };
            loadLanguage();
        }, [])
    );

    useEffect(() => {
        isMounted.current = true;
        Animated.timing(fadeEntrance, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        return () => { isMounted.current = false; };
    }, []);

    const [login, { loading }] = useMutation(LOGIN);

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }).start();
        if (type === 'error') {
            setTimeout(() => {
                if (isMounted.current) Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => setStatusMessage(null));
            }, 3000);
        }
    };

    // 💥 LOGIN MANUAL: Ahora guarda el username para el futuro desbloqueo 💥
    const ejecutarLogin = async () => {
        if (!username.trim() || !password) return showStatus(t.errorDatos, 'error');
        try {
            const { data } = await login({ variables: { username: username.trim(), password } });
            if (data?.login?.id && isMounted.current) {
                Keyboard.dismiss();

                // 🔥 MAGIA: Guardamos ID y USERNAME para la persistencia 🔥
                await SecureStore.setItemAsync('user_session_id', data.login.id.toString());
                await SecureStore.setItemAsync('saved_username', username.trim());

                showStatus(t.exitoLogin, 'success');
                setTimeout(() => {
                    if (isMounted.current) router.replace({ pathname: '/Home', params: { id: data.login.id.toString() } });
                }, 1200);
            }
        } catch (e: any) {
            if (isMounted.current) showStatus(t.errorServer, 'error');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#3D3B36' : '#F2F1EB' }}>
            <StatusBar barStyle="light-content" />

            <View className="h-[40%] items-center justify-center" style={{ backgroundColor: '#262422' }}>
                <Image
                    source={require('../assets/images/ICONO-WHRITE.png')}
                    className="w-80 h-80"
                    resizeMode="contain"
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <Animated.View
                        className="flex-1 -mt-12 rounded-t-[45px] px-10 pt-12 shadow-2xl"
                        style={{
                            opacity: fadeEntrance,
                            backgroundColor: isDarkMode ? '#3D3B36' : '#F2F1EB'
                        }}
                    >
                        <Text className={`text-4xl font-black mb-8 ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>
                            {t.titulo}
                        </Text>

                        <View className="mb-6">
                            <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.usuario}</Text>
                            <TextInput
                                className={`p-5 rounded-2xl text-lg border ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] text-black'}`}
                                placeholder={t.placeholderUser}
                                placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.pass}</Text>
                            <TextInput
                                className={`p-5 rounded-2xl text-lg border ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] text-black'}`}
                                placeholder={t.placeholderPass}
                                placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/forgot-password' as any)}
                            className="self-end mb-8"
                        >
                            <Text className={`text-sm font-semibold ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-400'}`}>
                                {t.olvido} <Text className={`font-bold ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.recuperar}</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`py-5 rounded-2xl items-center shadow-lg active:opacity-90 ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`}
                            onPress={ejecutarLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} />
                            ) : (
                                <Text className={`font-black text-xl tracking-widest ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.loginBtn}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/register' as any)}
                            className="mt-auto mb-10 items-center"
                        >
                            <Text className={`text-sm ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>
                                {t.noCuenta} <Text className={`font-black ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.registro}</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {statusMessage && (
                <Animated.View
                    style={{ transform: [{ translateY: sheetAnim }], zIndex: 100 }}
                    className={`absolute bottom-0 w-full rounded-t-[40px] p-12 items-center border-t-4 shadow-2xl 
                        ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-[#FAF9F5] border-[#EAE9E4]'} 
                        ${statusMessage.type === 'success' ? (isDarkMode ? 'border-t-[#9DB08B]' : 'border-t-[#8C977A]') : 'border-t-red-500'}`
                    }
                >
                    <View className={`w-12 h-1.5 rounded-full mb-6 ${isDarkMode ? 'bg-[#8C8A85]/30' : 'bg-zinc-200'}`} />
                    <Text className={`font-black text-2xl tracking-widest text-center ${statusMessage.type === 'success' ? (isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]') : 'text-red-500'}`}>
                        {statusMessage.text}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
}