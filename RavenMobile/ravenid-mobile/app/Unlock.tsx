import { gql, useMutation } from '@apollo/client';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useRef, useState } from 'react';
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
    login(username: $username, password: $password) { id }
  }
`;

// --- DICCIONARIO LOCAL ---
const i18n = {
    es: {
        hola: "HOLA DE NUEVO",
        desbloquear: "DESBLOQUEAR",
        huella: "USAR HUELLA",
        noEres: "¿NO ERES TÚ?",
        salir: "CERRAR SESIÓN",
        errorPass: "CONTRASEÑA INCORRECTA",
        errorInput: "INGRESA TU CONTRASEÑA",
        exito: "IDENTIDAD VERIFICADA",
        biometriaMsg: "Confirma tu identidad"
    },
    en: {
        hola: "WELCOME BACK",
        desbloquear: "UNLOCK",
        huella: "USE BIOMETRICS",
        noEres: "NOT YOU?",
        salir: "LOG OUT",
        errorPass: "INCORRECT PASSWORD",
        errorInput: "ENTER YOUR PASSWORD",
        exito: "IDENTITY VERIFIED",
        biometriaMsg: "Confirm your identity"
    }
};

export default function UnlockScreen() {
    const { isDarkMode } = useTheme();
    const [password, setPassword] = useState('');
    const [savedUsername, setSavedUsername] = useState('');
    const [savedId, setSavedId] = useState('');
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const t = i18n[lang];
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const isMounted = useRef(true);
    const sheetAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [loginMutation, { loading }] = useMutation(LOGIN);

    // --- CARGA INICIAL DE DATOS Y BIOMETRÍA ---
    useFocusEffect(
        useCallback(() => {
            isMounted.current = true;

            const initializeUnlock = async () => {
                try {
                    // 1. Cargar Idioma
                    const savedLang = await AsyncStorage.getItem('app_language');
                    if (savedLang === 'en' || savedLang === 'es') setLang(savedLang);

                    // 2. Cargar Sesión
                    const username = await SecureStore.getItemAsync('saved_username');
                    const id = await SecureStore.getItemAsync('user_session_id');
                    if (id && username) {
                        setSavedId(id);
                        setSavedUsername(username); // <--- Aquí se inyecta para que aparezca en el @

                        const photo = await AsyncStorage.getItem(`photo_${id}`);
                        if (photo) setUserPhoto(photo);

                        triggerBiometrics(id);
                    }
                    else {
                        // Si por algún motivo no hay datos, al Login
                        router.replace('/Login');
                    }
                } catch (e) {
                    router.replace('/Login');
                }
            };

            initializeUnlock();
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

            return () => { isMounted.current = false; };
        }, [])
    );

    const triggerBiometrics = async (userId: string) => {
        const hardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (hardware && enrolled) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t.biometriaMsg,
                cancelLabel: 'PIN',
                disableDeviceFallback: false,
            });

            if (result.success && isMounted.current) {
                showStatus(t.exito, 'success');
                setTimeout(() => router.replace({ pathname: '/Home', params: { id: userId } }), 1000);
            }
        }
    };

    const handleUnlockManual = async () => {
        if (!password) return showStatus(t.errorInput, 'error');
        try {
            const { data } = await loginMutation({ variables: { username: savedUsername, password } });
            if (data?.login?.id && isMounted.current) {
                Keyboard.dismiss();
                showStatus('OK', 'success');
                setTimeout(() => router.replace({ pathname: '/Home', params: { id: data.login.id.toString() } }), 1000);
            }
        } catch (e) {
            showStatus(t.errorPass, 'error');
        }
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('user_session_id');
        await SecureStore.deleteItemAsync('saved_username');
        router.replace('/Login');
    };

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }).start();
        setTimeout(() => {
            if (isMounted.current) Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => setStatusMessage(null));
        }, 3000);
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#262422' : '#8C977A' }}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center px-10">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <Animated.View style={{ opacity: fadeAnim }} className={`p-8 rounded-[45px] shadow-2xl ${isDarkMode ? 'bg-[#3D3B36]' : 'bg-[#F2F1EB]'}`}>



                        <View className="items-center mb-8">
                            {/* EL CÍRCULO DE LA FOTO O EL CANDADO */}
                            <View className={`w-28 h-28 rounded-full overflow-hidden border-4 mb-4 self-center items-center justify-center ${isDarkMode ? 'border-[#4A4843] bg-[#262422]' : 'border-[#EAE9E4] bg-white'}`}>
                                {userPhoto ? (
                                    <Image source={{ uri: userPhoto }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <Feather name="lock" size={32} color={isDarkMode ? '#9DB08B' : '#8C977A'} />
                                )}
                            </View>

                            {/* LOS TEXTOS (Aquí está el username) */}
                            <Text className={`text-xl font-black tracking-widest ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>
                                {t.hola}
                            </Text>
                            <Text className={`font-bold mt-1 tracking-widest uppercase ${isDarkMode ? 'text-[#EAE9E4]' : 'text-zinc-800'}`}>
                                @{savedUsername}
                            </Text>
                        </View>


                        <View className="mb-6">
                            <TextInput
                                className={`p-5 rounded-2xl text-center text-lg border ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-white border-[#EAE9E4] text-black'}`}
                                placeholder="••••••••"
                                placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity className={`py-5 rounded-2xl items-center shadow-lg mb-4 ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`} onPress={handleUnlockManual} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text className={`font-black tracking-[3px] uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.desbloquear}</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => triggerBiometrics(savedId)} className={`py-4 rounded-2xl items-center border flex-row justify-center mb-6 ${isDarkMode ? 'border-[#4A4843] bg-[#262422]' : 'border-[#EAE9E4] bg-white'}`}>
                            <Feather name="key" size={18} color={isDarkMode ? '#9DB08B' : '#8C977A'} />
                            <Text className={`ml-3 font-bold tracking-widest text-[10px] ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-600'}`}>{t.huella}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLogout} className="items-center">
                            <Text className={`text-[10px] font-bold tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.noEres} <Text className="text-red-500">{t.salir}</Text></Text>
                        </TouchableOpacity>

                    </Animated.View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {statusMessage && (
                <Animated.View style={{ transform: [{ translateY: sheetAnim }], zIndex: 100 }} className={`absolute bottom-0 w-full rounded-t-[40px] p-12 items-center border-t-4 shadow-2xl ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-[#FAF9F5] border-[#EAE9E4]'} ${statusMessage.type === 'success' ? (isDarkMode ? 'border-t-[#9DB08B]' : 'border-t-[#8C977A]') : 'border-t-red-500'}`}>
                    <View className={`w-12 h-1.5 rounded-full mb-6 ${isDarkMode ? 'bg-[#8C8A85]/30' : 'bg-zinc-200'}`} />
                    <Text className={`font-black text-lg tracking-widest text-center ${statusMessage.type === 'success' ? (isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]') : 'text-red-500'}`}>{statusMessage.text}</Text>
                </Animated.View>
            )}
        </View>
    );
}