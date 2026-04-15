import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 💥 Importamos useFocusEffect y useCallback
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // 💥 Importante para destruir la sesión
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StatusBar,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const SOLICITAR_PIN = gql`
  mutation Solicitar($email: String!) {
    solicitarRecuperacionPassword(email: $email)
  }
`;

const RESETEAR_PASS = gql`
  mutation Resetear($email: String!, $pin: String!, $nuevaPassword: String!) {
    resetearPasswordConPin(email: $email, pin: $pin, nuevaPassword: $nuevaPassword)
  }
`;

// --- DICCIONARIO DE IDIOMAS ---
const i18n = {
    es: {
        titulo: "RECUPERAR CONTRASEÑA",
        paso1: "PASO 1/2",
        paso2: "PASO 2/2",
        instruccion1: "INGRESA EL CORREO ELECTRÓNICO ASOCIADO A TU CUENTA",
        instruccion2: "RESTABLECER CREDENCIALES",
        correo: "CORREO ELECTRÓNICO",
        placeholderCorreo: "ejemplo@gmail.com",
        codigo: "CÓDIGO DE SEGURIDAD (6 DÍGITOS)",
        nuevaPass: "NUEVA CONTRASEÑA",
        placeholderPass: "••••••••",
        continuarBtn: "CONTINUAR",
        confirmarBtn: "CONFIRMAR",
        cancelarBtn: "CANCELAR",
        reintentar: "¿CÓDIGO EXPIRADO? ",
        reintentarLink: "REINTENTAR",
        errCorreoV: "INGRESA UN CORREO VÁLIDO",
        errNoReg: "CORREO NO REGISTRADO",
        exitoEnvio: "CÓDIGO ENVIADO",
        errIncompletos: "DATOS INCOMPLETOS",
        errPin: "PIN INCORRECTO O CADUCADO",
        exitoReset: "CONTRASEÑA ACTUALIZADA"
    },
    en: {
        titulo: "RECOVER PASSWORD",
        paso1: "STEP 1/2",
        paso2: "STEP 2/2",
        instruccion1: "ENTER THE EMAIL ASSOCIATED WITH YOUR ACCOUNT",
        instruccion2: "RESET CREDENTIALS",
        correo: "EMAIL ADDRESS",
        placeholderCorreo: "example@gmail.com",
        codigo: "SECURITY CODE (6 DIGITS)",
        nuevaPass: "NEW PASSWORD",
        placeholderPass: "••••••••",
        continuarBtn: "CONTINUE",
        confirmarBtn: "CONFIRM",
        cancelarBtn: "CANCEL",
        reintentar: "CODE EXPIRED? ",
        reintentarLink: "RETRY",
        errCorreoV: "ENTER A VALID EMAIL",
        errNoReg: "UNREGISTERED EMAIL",
        exitoEnvio: "CODE SENT",
        errIncompletos: "INCOMPLETE DATA",
        errPin: "INCORRECT OR EXPIRED PIN",
        exitoReset: "PASSWORD UPDATED"
    }
};

export default function ForgotPasswordScreen() {
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    // ESTADO PARA IDIOMA
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const t = i18n[lang];

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const slideEntrance = useRef(new Animated.Value(30)).current;
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
                    console.log("Error cargando idioma en Recover:", e);
                }
            };
            loadLanguage();
        }, [])
    );

    useEffect(() => {
        isMounted.current = true;
        Animated.parallel([
            Animated.timing(fadeEntrance, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideEntrance, { toValue: 0, duration: 800, useNativeDriver: true })
        ]).start();
        return () => { isMounted.current = false; };
    }, []);

    const [solicitarPin, { loading: loadingPin }] = useMutation(SOLICITAR_PIN);
    const [resetearPass, { loading: loadingReset }] = useMutation(RESETEAR_PASS);

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }).start();
        setTimeout(() => {
            if (isMounted.current) {
                Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => {
                    if (isMounted.current) setStatusMessage(null);
                });
            }
        }, 3000);
    };

    const handleSolicitar = async () => {
        if (!email.trim().includes('@')) return showStatus(t.errCorreoV, 'error');
        try {
            await solicitarPin({ variables: { email: email.trim().toLowerCase() } });
            if (isMounted.current) {
                showStatus(t.exitoEnvio, 'success');
                setTimeout(() => {
                    if (isMounted.current) setStep(2);
                }, 1000);
            }
        } catch (e: any) {
            if (isMounted.current) showStatus(t.errNoReg, 'error');
        }
    };

    const handleReset = async () => {
        if (pin.length < 6 || newPassword.length < 4) return showStatus(t.errIncompletos, 'error');
        try {
            const { data } = await resetearPass({
                variables: {
                    email: email.trim().toLowerCase(),
                    pin: pin.trim(),
                    nuevaPassword: newPassword
                }
            });
            if (data && isMounted.current) {

                // 💥 AQUÍ DESTRUIMOS LA SESIÓN BIOMÉTRICA POR SEGURIDAD 💥
                await SecureStore.deleteItemAsync('user_session_id');

                showStatus(t.exitoReset, 'success');
                setTimeout(() => {
                    if (isMounted.current) router.replace('/' as any);
                }, 2000);
            }
        } catch (e: any) {
            if (isMounted.current) showStatus(t.errPin, 'error');
        }
    };

    const goBackSafe = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/' as any);
    };

    // --- COLORES DINÁMICOS SAGE / TAUPE ---
    const bgColor = isDarkMode ? '#3D3B36' : '#F2F1EB';
    const headerColor = isDarkMode ? '#262422' : '#8C977A';

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <StatusBar barStyle="light-content" />

            {/* HEADER ESTILO LOGIN */}
            <View className="h-[35%] items-center justify-center pt-8" style={{ backgroundColor: headerColor }}>
                <Image
                    source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')}
                    className="w-64 h-64 -mb-8"
                    resizeMode="contain"
                />
                <Text className={`text-2xl text-center font-black tracking-[4px] uppercase px-4 ${isDarkMode ? 'text-[#9DB08B]' : 'text-white'}`}>
                    {t.titulo}
                </Text>
                <Text className={`text-xs font-bold tracking-[4px] mt-2 opacity-80 ${isDarkMode ? 'text-white' : 'text-[#F2E7D5]'}`}>
                    {step === 1 ? t.paso1 : t.paso2}
                </Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {/* CUERPO SUPERPUESTO */}
                    <Animated.View
                        className="flex-1 -mt-8 rounded-t-[45px] shadow-2xl overflow-hidden"
                        style={{
                            opacity: fadeEntrance,
                            transform: [{ translateY: slideEntrance }],
                            backgroundColor: bgColor
                        }}
                    >
                        <ScrollView contentContainerStyle={{ paddingHorizontal: 40, paddingTop: 40, paddingBottom: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                            {step === 1 ? (
                                <View>
                                    <Text className={`text-[10px] font-black tracking-widest text-center mb-8 uppercase ${isDarkMode ? 'text-[#8C8A85]' : 'text-[#8C977A]'}`}>
                                        {t.instruccion1}
                                    </Text>
                                    <View className="mb-6">
                                        <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.correo}</Text>
                                        <TextInput
                                            className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                            placeholder={t.placeholderCorreo}
                                            placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        className={`py-5 rounded-2xl items-center shadow-lg active:opacity-90 mt-2 ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`}
                                        onPress={handleSolicitar}
                                        disabled={loadingPin}
                                    >
                                        {loadingPin ? (
                                            <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} />
                                        ) : (
                                            <Text className={`font-black text-sm tracking-[3px] uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>
                                                {t.continuarBtn}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text className={`text-[10px] font-black tracking-widest text-center mb-8 uppercase ${isDarkMode ? 'text-[#8C8A85]' : 'text-[#8C977A]'}`}>
                                        {t.instruccion2}
                                    </Text>

                                    <View className="mb-6">
                                        <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.codigo}</Text>
                                        <TextInput
                                            className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                            placeholder="000000"
                                            placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                            value={pin}
                                            onChangeText={setPin}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>

                                    <View className="mb-8">
                                        <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.nuevaPass}</Text>
                                        <TextInput
                                            className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                            placeholder={t.placeholderPass}
                                            placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                            secureTextEntry
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        className={`py-5 rounded-2xl items-center shadow-lg active:opacity-90 ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`}
                                        onPress={handleReset}
                                        disabled={loadingReset}
                                    >
                                        {loadingReset ? (
                                            <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} />
                                        ) : (
                                            <Text className={`font-black text-sm tracking-[3px] uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>
                                                {t.confirmarBtn}
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setStep(1)} className="mt-8 items-center">
                                        <Text className={`font-bold text-[10px] tracking-widest uppercase ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>
                                            {t.reintentar}
                                            <Text className={`font-black ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>
                                                {t.reintentarLink}
                                            </Text>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity onPress={goBackSafe} className="mt-10 items-center">
                                <Text className="text-[#FF4D4D] font-black text-xs tracking-[2px]">{t.cancelarBtn}</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* SHEET DE STATUS */}
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