import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 💥 Importamos useFocusEffect
import { router, useFocusEffect } from 'expo-router';
// 💥 Importamos useCallback
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

const REGISTRAR = gql`
  mutation Registrar($input: CreateUsuarioSistemaInput!) { 
    registrarAlumno(input: $input) { id } 
  }
`;

// --- DICCIONARIO DE IDIOMAS ---
const i18n = {
    es: {
        titulo: "REGISTRAR CUENTA",
        subtitulo: "NUEVO USUARIO",
        usuario: "NOMBRE DE USUARIO",
        correo: "CORREO ELECTRÓNICO",
        pass: "CONTRASEÑA",
        confirmar: "CONFIRMAR CONTRASEÑA",
        placeholderUser: "ejemploUser",
        placeholderCorreo: "ejemplo@gmail.com",
        placeholderPass: "••••••••",
        continuarBtn: "CONTINUAR",
        cancelarBtn: "CANCELAR",
        errCampos: "LLENA TODOS LOS CAMPOS",
        errCorreo: "CORREO INVÁLIDO",
        errClaves: "LAS CLAVES NO COINCIDEN",
        exito: "CUENTA CREADA",
        errDuplicado: "CORREO YA VINCULADO A OTRO USUARIO",
        errServidor: "FALLO EN EL SERVIDOR O DATOS INVÁLIDOS"
    },
    en: {
        titulo: "REGISTER ACCOUNT",
        subtitulo: "NEW USER",
        usuario: "USERNAME",
        correo: "EMAIL ADDRESS",
        pass: "PASSWORD",
        confirmar: "CONFIRM PASSWORD",
        placeholderUser: "exampleUser",
        placeholderCorreo: "example@gmail.com",
        placeholderPass: "••••••••",
        continuarBtn: "CONTINUE",
        cancelarBtn: "CANCEL",
        errCampos: "FILL ALL FIELDS",
        errCorreo: "INVALID EMAIL",
        errClaves: "PASSWORDS DO NOT MATCH",
        exito: "ACCOUNT CREATED",
        errDuplicado: "EMAIL ALREADY LINKED TO ANOTHER USER",
        errServidor: "SERVER ERROR OR INVALID DATA"
    }
};

export default function RegisterScreen() {
    const { isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    // ESTADO PARA IDIOMA
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const t = i18n[lang];

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const slideEntrance = useRef(new Animated.Value(30)).current;
    const sheetAnim = useRef(new Animated.Value(height)).current;

    // 💥 HOOK PARA EL IDIOMA: Lee la memoria al entrar a la pantalla
    useFocusEffect(
        useCallback(() => {
            const loadLanguage = async () => {
                try {
                    const savedLang = await AsyncStorage.getItem('app_language');
                    if (savedLang === 'en' || savedLang === 'es') {
                        setLang(savedLang);
                    }
                } catch (e) {
                    console.log("Error cargando idioma en Register:", e);
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

    const [registrar, { loading }] = useMutation(REGISTRAR);

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }).start();
        if (type === 'error') {
            setTimeout(() => {
                if (isMounted.current) {
                    Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => {
                        if (isMounted.current) setStatusMessage(null);
                    });
                }
            }, 3500);
        }
    };

    const ejecutarRegistro = async () => {
        if (!username.trim() || !email.trim() || password.length < 4) return showStatus(t.errCampos, 'error');
        if (!email.includes('@')) return showStatus(t.errCorreo, 'error');
        if (password !== confirm) return showStatus(t.errClaves, 'error');

        try {
            const { data } = await registrar({ variables: { input: { username: username.trim(), email: email.trim().toLowerCase(), password, rol_id: 2 } } });
            if (data?.registrarAlumno?.id && isMounted.current) {
                showStatus(t.exito, 'success');
                setTimeout(() => { if (isMounted.current) router.replace('/'); }, 1500);
            }
        } catch (e: any) {
            const errorMsg = String(e).toLowerCase();
            if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('correo') || errorMsg.includes('email')) {
                showStatus(t.errDuplicado, 'error');
            } else {
                showStatus(t.errServidor, 'error');
            }
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
                <Text className={`text-2xl font-black tracking-[6px] uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-white'}`}>
                    {t.titulo}
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

                            <Text className={`text-xs font-black tracking-widest text-center mb-8 ${isDarkMode ? 'text-[#8C8A85]' : 'text-[#8C977A]'}`}>
                                {t.subtitulo}
                            </Text>

                            {/* INPUT USERNAME */}
                            <View className="mb-6">
                                <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.usuario}</Text>
                                <TextInput
                                    className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder={t.placeholderUser}
                                    placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* INPUT EMAIL */}
                            <View className="mb-6">
                                <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.correo}</Text>
                                <TextInput
                                    className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    placeholder={t.placeholderCorreo}
                                    placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* INPUT PASSWORD */}
                            <View className="mb-6">
                                <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.pass}</Text>
                                <TextInput
                                    className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={t.placeholderPass}
                                    placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                />
                            </View>

                            {/* INPUT CONFIRM PASSWORD */}
                            <View className="mb-8">
                                <Text className={`font-bold text-xs mb-3 ml-1 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.confirmar}</Text>
                                <TextInput
                                    className={`p-5 rounded-2xl text-base border border-l-4 ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] border-l-[#9DB08B] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] border-l-[#8C977A] text-black'}`}
                                    secureTextEntry
                                    value={confirm}
                                    onChangeText={setConfirm}
                                    placeholder={t.placeholderPass}
                                    placeholderTextColor={isDarkMode ? '#8C8A85' : '#A1A1AA'}
                                />
                            </View>

                            {/* BOTÓN DE REGISTRO */}
                            <TouchableOpacity
                                className={`py-5 rounded-2xl items-center shadow-lg active:opacity-90 mt-2 ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`}
                                onPress={ejecutarRegistro}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} />
                                ) : (
                                    <Text className={`font-black text-sm tracking-[3px] uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>
                                        {t.continuarBtn}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* BOTÓN CANCELAR */}
                            <TouchableOpacity onPress={goBackSafe} className="mt-8 items-center">
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