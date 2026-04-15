import { gql, useMutation, useQuery } from '@apollo/client';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
// 💥 RESTRICCIÓN DE SEGURIDAD BIOMÉTRICA
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator, Animated, Dimensions, FlatList, Image,
    KeyboardAvoidingView,
    Linking, Modal, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// --- GRAPHQL ---
const GET_STATUS = gql`
  query GetStatus($id: Int!) {
    getUsuarioStatus(id: $id) {
      id username registro_completo 
      alumnos { nombre_completo matricula carrera semestre grupo_id }
    }
  }
`;
const GENERAR_QR = gql`
  mutation GenerarQR($usuarioId: Int!) {
    generarCredencial(usuarioId: $usuarioId) { qr_hash }
  }
`;
const GET_CARRERAS = gql`query GetCarreras { carreras { id nombre grupos { id nombre } } }`;
const ACTUALIZAR = gql`
  mutation Actualizar($id: Int!, $input: UpdateUsuarioSistemaInput!) { 
    actualizarAlumno(id: $id, input: $input) { id registro_completo } 
  }
`;
const SOLICITAR_PIN = gql`
  mutation Solicitar($email: String!) { solicitarRecuperacionPassword(email: $email) }
`;
const RESETEAR_PASS = gql`
  mutation Resetear($email: String!, $pin: String!, $nuevaPassword: String!) { resetearPasswordConPin(email: $email, pin: $pin, nuevaPassword: $nuevaPassword) }
`;

// --- DICCIONARIO DE IDIOMAS ---
const i18n = {
    es: {
        ficha: "FICHA", acceso: "ACCESO", ajustes: "AJUSTES",
        foto: "CAMBIAR FOTO", semestre: "Sem", pendiente: "IDENTIDAD PENDIENTE",
        instruccion_ficha: "Completa tu registro en Ficha.",
        generar: "GENERAR ACCESO", activo: "CÓDIGO ACTIVO", expiracion: "s",
        crear_reg: "CREAR REGISTRO", act_reg: "ACTUALIZAR REGISTRO", nombre: "NOMBRE COMPLETO",
        matricula: "MATRÍCULA", carrera: "CARRERA ACADÉMICA", grupo: "GRUPO", finalizar: "FINALIZAR REGISTRO",
        seleccionar: "-- Seleccionar --", cancelar: "CANCELAR",
        direccion: "Ubicacion - UTVT", passwords: "Cambiar Contraseña", idioma: "Idioma", privacidad: "Privacidad", salir: "Cerrar Sesión",
        editar_frase: "Toca para editar", guardar: "GUARDAR", editar_pensamiento: "Editar Pensamiento",
        entendido: "ENTENDIDO", privacidad_title: "PRIVACIDAD QRIFY", privacidad_body: "Tus datos académicos están blindados. El sistema solo utiliza tu información para generar accesos seguros.",
        recuperar_title: "RESTABLECER", recuperar_step1: "INGRESA TU CORREO ASOCIADO", enviar_codigo: "ENVIAR CÓDIGO",
        codigo_seguridad: "CÓDIGO (6 DÍGITOS)", nueva_pass: "NUEVA CONTRASEÑA", confirmar: "CONFIRMAR", reintentar: "¿CÓDIGO EXPIRADO? REINTENTAR"
    },
    en: {
        ficha: "PROFILE", acceso: "ACCESS", ajustes: "SETTINGS",
        foto: "CHANGE PHOTO", semestre: "Sem", pendiente: "PENDING IDENTITY",
        instruccion_ficha: "Complete your profile registration.",
        generar: "GENERATE ACCESS", activo: "ACTIVE CODE", expiracion: "s",
        crear_reg: "CREATE RECORD", act_reg: "UPDATE RECORD", nombre: "FULL NAME",
        matricula: "STUDENT ID", carrera: "ACADEMIC MAJOR", grupo: "CLASS GROUP", finalizar: "FINISH REGISTRATION",
        seleccionar: "-- Select --", cancelar: "CANCEL",
        direccion: "UTVT - Location", passwords: "Change Password", idioma: "Language", privacidad: "Privacy", salir: "Log Out",
        editar_frase: "Tap to edit", guardar: "SAVE", editar_pensamiento: "Edit Quote",
        entendido: "UNDERSTOOD", privacidad_title: "QRIFY PRIVACY", privacidad_body: "Your academic data is shielded. The system only uses your info to generate secure access.",
        recuperar_title: "RESET PASSWORD", recuperar_step1: "ENTER ASSOCIATED EMAIL", enviar_codigo: "SEND CODE",
        codigo_seguridad: "SECURITY CODE (6 DIGITS)", nueva_pass: "NEW PASSWORD", confirmar: "CONFIRM", reintentar: "CODE EXPIRED? RETRY"
    }
};

export default function HomeScreen() {
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string, 10) : null;
    const { isDarkMode, toggleTheme } = useTheme();

    const [lang, setLang] = useState<'es' | 'en'>('es');
    const t = i18n[lang];

    const barWidth = width * 0.75;
    const tabWidth = barWidth / 3;
    const scrollX = useRef(new Animated.Value(width)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(1);

    const [isAnimatingTheme, setIsAnimatingTheme] = useState(false);
    const themeScale = useRef(new Animated.Value(0)).current;
    const themeOpacity = useRef(new Animated.Value(1)).current;
    const themeRotate = useRef(new Animated.Value(0)).current;

    const rippleColor = isDarkMode ? '#F2F1EB' : '#3D3B36';

    const triggerThemeChange = () => {
        if (isAnimatingTheme) return;
        setIsAnimatingTheme(true);
        themeOpacity.setValue(1);
        Animated.timing(themeRotate, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        Animated.timing(themeScale, { toValue: 150, duration: 350, useNativeDriver: true }).start(() => {
            toggleTheme();
            setTimeout(() => {
                Animated.timing(themeOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                    themeScale.setValue(0);
                    themeRotate.setValue(0);
                    setIsAnimatingTheme(false);
                });
            }, 50);
        });
    };

    const spin = themeRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

    const [userQuote, setUserQuote] = useState('Work hard in silence. Let your success be the noise.');
    const [tempQuote, setTempQuote] = useState('');

    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    const [qrValue, setQrValue] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [cycle, setCycle] = useState(0);

    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [semestre, setSemestre] = useState('');
    const [carreraId, setCarreraId] = useState('');
    const [grupoId, setGrupoId] = useState('');
    const [selectorType, setSelectorType] = useState<'carrera' | 'grupo' | null>(null);

    const [resetEmail, setResetEmail] = useState('');
    const [resetPin, setResetPin] = useState('');
    const [resetNewPass, setResetNewPass] = useState('');
    const [resetStep, setResetStep] = useState(1);

    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [isEditingQuote, setIsEditingQuote] = useState(false);
    const [selectorModalVisible, setSelectorModalVisible] = useState(false);
    const [passModalVisible, setPassModalVisible] = useState(false);
    const [langModalVisible, setLangModalVisible] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const isMounted = useRef(true);
    const sheetAnim = useRef(new Animated.Value(height)).current;

    const { data, loading, refetch: refetchStatus } = useQuery(GET_STATUS, { variables: { id: userId || 0 }, skip: !userId, fetchPolicy: 'cache-and-network' });
    const { data: carrerasData } = useQuery(GET_CARRERAS, { fetchPolicy: 'cache-and-network' });
    const [crearCredencial] = useMutation(GENERAR_QR);
    const [actualizar, { loading: guardando }] = useMutation(ACTUALIZAR);
    const [solicitarPin, { loading: loadingPin }] = useMutation(SOLICITAR_PIN);
    const [resetearPass, { loading: loadingReset }] = useMutation(RESETEAR_PASS);

    const carreras = carrerasData?.carreras || [];
    const carreraActual = useMemo(() => carreras.find((c: any) => String(c.id) === String(carreraId)), [carreras, carreraId]);
    const grupos = carreraActual?.grupos || [];
    const grupoActual = useMemo(() => grupos.find((g: any) => String(g.id) === String(grupoId)), [grupos, grupoId]);

    const rawData = data?.getUsuarioStatus || {};
    const registroCompleto = rawData.registro_completo === true;
    const alumnosArr = rawData.alumnos;
    const alumno = Array.isArray(alumnosArr) && alumnosArr.length > 0 ? alumnosArr[0] : (alumnosArr || null);
    const nombreDisplay = alumno?.nombre_completo || rawData.username || "Usuario";
    const carreraDisplay = alumno?.carrera || (registroCompleto ? "..." : t.pendiente);
    const semestreDisplay = alumno?.semestre ? `${alumno.semestre}` : (registroCompleto ? "..." : "---");

    useEffect(() => {
        isMounted.current = true;
        const fetchLang = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('app_language');
                if ((savedLang === 'en' || savedLang === 'es') && isMounted.current) setLang(savedLang);
            } catch (e) { console.log(e); }
        }
        fetchLang();
        if (userId) {
            AsyncStorage.getItem(`photo_${userId}`).then(p => p && isMounted.current ? setUserPhoto(p) : null);
            AsyncStorage.getItem(`quote_${userId}`).then(q => q && isMounted.current ? setUserQuote(q) : null);
        }
        return () => { isMounted.current = false; };
    }, [userId]);

    useEffect(() => {
        let timer: any = null;
        if (qrValue) {
            timer = setInterval(() => {
                if (!isMounted.current) return;
                setTimeLeft((prev) => {
                    if (prev <= 1) { cycle < 1 ? refrescarQR() : setQrValue(null); return 30; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => timer && clearInterval(timer);
    }, [qrValue, cycle]);

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 15, friction: 8, useNativeDriver: true }).start();
        setTimeout(() => {
            if (isMounted.current) Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => setStatusMessage(null));
        }, 3000);
    };

    const refrescarQR = async () => { if (!userId) return; try { const { data: res } = await crearCredencial({ variables: { usuarioId: userId } }); if (res?.generarCredencial?.qr_hash && isMounted.current) { setQrValue(res.generarCredencial.qr_hash); setCycle(1); } } catch (e) { if (isMounted.current) setQrValue(null); } };
    const generarQR = async () => { if (!userId) return; try { const { data: res } = await crearCredencial({ variables: { usuarioId: userId } }); if (res?.generarCredencial?.qr_hash && isMounted.current) { setQrValue(res.generarCredencial.qr_hash); setCycle(0); setTimeLeft(30); } } catch (e) { } };

    const manejarFoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.5 });
        if (!result.canceled && result.assets[0].uri && isMounted.current) {
            setUserPhoto(result.assets[0].uri);
            await AsyncStorage.setItem(`photo_${userId}`, result.assets[0].uri);
        }
    };

    const guardarFicha = async () => {
        const sInt = parseInt(semestre);
        const gInt = parseInt(grupoId);
        if (!userId || !nombre.trim() || !matricula.trim() || isNaN(sInt) || isNaN(gInt)) return showStatus("DATOS INCOMPLETOS", "error");
        try {
            await actualizar({ variables: { id: userId, input: { id: userId, nombre_completo: nombre.trim(), matricula: matricula.trim(), carrera: carreraActual?.nombre || '', semestre: sInt, grupo_id: gInt, registro_completo: true } } });
            showStatus("REGISTRO EXITOSO", "success");
            await refetchStatus();
            setTimeout(() => { if (isMounted.current) handleTabPress(1); }, 1500);
        } catch (e) { showStatus("ERROR DE SERVIDOR", "error"); }
    };

    const guardarFrase = async () => {
        await AsyncStorage.setItem(`quote_${userId}`, tempQuote);
        setUserQuote(tempQuote);
        setIsEditingQuote(false);
        showStatus("FRASE ACTUALIZADA", "success");
    };

    const cambiarIdioma = async (nuevoLang: 'es' | 'en') => {
        setLang(nuevoLang);
        await AsyncStorage.setItem('app_language', nuevoLang);
        setLangModalVisible(false);
    };

    const abrirMapaUTVT = () => Linking.openURL('https://maps.app.goo.gl/tKxYsfgEJKXr5tUq9');

    const handleTabPress = (index: number) => { scrollViewRef.current?.scrollTo({ x: index * width, animated: true }); setActiveIndex(index); };
    const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false });
    const onMomentumScrollEnd = (e: any) => { setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width)); };
    const indicatorTranslateX = scrollX.interpolate({ inputRange: [0, width, width * 2], outputRange: [0, tabWidth, tabWidth * 2] });
    const logoOpacity = scrollX.interpolate({ inputRange: [0, width, width * 2], outputRange: [1, 1, 0] });

    const handleSolicitarPin = async () => {
        if (!resetEmail.includes('@')) return showStatus('CORREO INVÁLIDO', 'error');
        try { await solicitarPin({ variables: { email: resetEmail.trim().toLowerCase() } }); showStatus('CÓDIGO ENVIADO', 'success'); setResetStep(2); } catch (e) { showStatus('ERROR AL ENVIAR', 'error'); }
    };

    // 💥 SEGURIDAD: RESTABLECER CONTRASEÑA Y CERRAR SESIÓN
    const handleResetear = async () => {
        if (resetPin.length < 6 || resetNewPass.length < 4) return showStatus('DATOS INCOMPLETOS', 'error');
        try {
            await resetearPass({ variables: { email: resetEmail.trim().toLowerCase(), pin: resetPin.trim(), nuevaPassword: resetNewPass } });
            showStatus('CONTRASEÑA ACTUALIZADA', 'success');
            setTimeout(async () => {
                setPassModalVisible(false);
                setResetStep(1);
                await SecureStore.deleteItemAsync('user_session_id');
                await SecureStore.deleteItemAsync('saved_username');
                router.replace('/');
            }, 1500);
        } catch (e) { showStatus('PIN INVÁLIDO', 'error'); }
    };

    const ConfigMenuItem = ({ icon, text, onPress, isDanger = false, isLast = false }: any) => (
        <TouchableOpacity onPress={onPress} className={`flex-row items-center justify-between p-5 ${!isLast ? (isDarkMode ? 'border-b border-[#4A4843]' : 'border-b border-[#EAE9E4]') : ''}`}>
            <View className="flex-row items-center">
                <Feather name={icon as any} size={20} color={isDanger ? '#ef4444' : (isDarkMode ? '#9DB08B' : '#8C977A')} />
                <Text className={`ml-4 font-black tracking-widest text-[10px] uppercase ${isDanger ? 'text-red-500' : (isDarkMode ? 'text-[#EAE9E4]' : 'text-zinc-700')}`}>{text}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDarkMode ? '#8C8A85' : '#b5b4ad'} />
        </TouchableOpacity>
    );

    // --- BLOQUE DE CÓDIGO DEL MENSAJE REUTILIZABLE ---
    const StatusView = () => (
        statusMessage ? (
            <Animated.View style={{ transform: [{ translateY: sheetAnim }], zIndex: 9999, elevation: 9999 }} className={`absolute bottom-0 w-full rounded-t-[45px] py-10 items-center border-t-4 shadow-2xl ${isDarkMode ? 'bg-[#262422] border-[#9DB08B]' : 'bg-[#FAF9F5] border-[#8C977A]'} ${statusMessage.type === 'error' ? 'border-[#FF4D4D]' : ''}`}>
                <View className={`w-12 h-1.5 rounded-full mb-6 ${isDarkMode ? 'bg-[#8C8A85]/30' : 'bg-black/10'}`} />
                <Text className={`font-black text-lg tracking-widest text-center px-4 ${statusMessage.type === 'success' ? (isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]') : 'text-[#FF4D4D]'}`}>{statusMessage.text}</Text>
            </Animated.View>
        ) : null
    );

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#3D3B36' : '#F2F1EB' }}>
            <Animated.View pointerEvents="none" style={{ position: 'absolute', top: Platform.OS === 'ios' ? 65 : 45, right: 35, width: 40, height: 40, borderRadius: 20, backgroundColor: rippleColor, transform: [{ scale: themeScale }], opacity: themeOpacity, zIndex: 999999, elevation: 999999 }} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

                <Modal visible={isEditingQuote} transparent animationType="fade">
                    <View className="flex-1 bg-black/90 justify-center items-center px-8 z-50">
                        <View className={`w-full p-8 rounded-[40px] border shadow-2xl ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-white border-[#EAE9E4]'}`}>
                            <Text className={`font-black text-center mb-6 tracking-widest uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.editar_pensamiento}</Text>
                            <TextInput className={`p-5 rounded-2xl border mb-6 text-center ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-[#FAF9F5] border-[#EAE9E4] text-black'}`} multiline numberOfLines={3} value={tempQuote} onChangeText={setTempQuote} maxLength={100} />
                            <View className="flex-row justify-between items-center">
                                <TouchableOpacity onPress={() => setIsEditingQuote(false)} className="px-4 py-4"><Text className={`font-bold tracking-widest text-[10px] uppercase ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.cancelar}</Text></TouchableOpacity>
                                <TouchableOpacity onPress={guardarFrase} className={`px-8 py-4 rounded-2xl shadow-lg ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`}><Text className={`font-black tracking-widest text-[10px] uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.guardar}</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={privacyVisible} transparent animationType="fade">
                    <View className="flex-1 bg-black/90 justify-center items-center px-6 z-50">
                        <View className={`w-full p-10 rounded-[45px] border shadow-2xl ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-[#FAF9F5] border-[#8C977A]'}`}>
                            <Feather name="shield" size={40} color={isDarkMode ? '#9DB08B' : '#8C977A'} className="self-center mb-6" />
                            <Text className={`font-black text-center mb-6 tracking-widest ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.privacidad_title}</Text>
                            <Text className={`text-center font-medium leading-6 mb-8 ${isDarkMode ? 'text-[#D0CFCB]' : 'text-black/80'}`}>{t.privacidad_body}</Text>
                            <TouchableOpacity className={`p-5 rounded-full items-center shadow-lg ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`} onPress={() => setPrivacyVisible(false)}><Text className={`font-black tracking-widest ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.entendido}</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={passModalVisible} transparent animationType="fade">
                    <View className="flex-1 bg-black/90 justify-center items-center px-6 z-50">
                        <View className={`w-full p-8 rounded-[45px] border shadow-2xl ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-[#FAF9F5] border-[#EAE9E4]'}`}>
                            <Text className={`font-black text-center mb-6 tracking-widest uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.recuperar_title}</Text>
                            {resetStep === 1 ? (
                                <View className="w-full">
                                    <Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.recuperar_step1}</Text>
                                    <TextInput className={`p-5 rounded-2xl mb-6 border ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-white border-[#EAE9E4] text-black'}`} placeholder="email@gmail.com" placeholderTextColor="#888" autoCapitalize="none" keyboardType="email-address" value={resetEmail} onChangeText={setResetEmail} />
                                    <TouchableOpacity className={`p-5 rounded-full items-center shadow-lg ${loadingPin ? 'bg-[#35332F]' : (isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]')}`} onPress={handleSolicitarPin} disabled={loadingPin}>
                                        {loadingPin ? <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} /> : <Text className={`font-black tracking-widest uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.enviar_codigo}</Text>}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="w-full">
                                    <Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.codigo_seguridad}</Text>
                                    <TextInput className={`p-5 rounded-2xl mb-4 border ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-white border-[#EAE9E4] text-black'}`} keyboardType="number-pad" maxLength={6} value={resetPin} onChangeText={setResetPin} />
                                    <Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.nueva_pass}</Text>
                                    <TextInput className={`p-5 rounded-2xl mb-6 border ${isDarkMode ? 'bg-[#35332F] border-[#4A4843] text-white' : 'bg-white border-[#EAE9E4] text-black'}`} secureTextEntry value={resetNewPass} onChangeText={setResetNewPass} />
                                    <TouchableOpacity className={`p-5 rounded-full items-center shadow-lg ${loadingReset ? 'bg-[#35332F]' : (isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]')}`} onPress={handleResetear} disabled={loadingReset}>
                                        {loadingReset ? <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} /> : <Text className={`font-black tracking-widest uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.confirmar}</Text>}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setResetStep(1)} className="mt-4"><Text className={`text-center font-bold text-[10px] tracking-widest ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.reintentar}</Text></TouchableOpacity>
                                </View>
                            )}
                            <TouchableOpacity onPress={() => { setPassModalVisible(false); setResetStep(1); }} className="mt-6"><Text className="text-red-500 font-black text-center tracking-widest text-[10px] uppercase">{t.cancelar}</Text></TouchableOpacity>
                        </View>
                        {/* 💥 EL MENSAJE AHORA SE DIBUJA DENTRO DEL MODAL PARA QUE NO QUEDE ATRÁS 💥 */}
                        <StatusView />
                    </View>
                </Modal>

                <Modal visible={langModalVisible} transparent animationType="fade">
                    <View className="flex-1 bg-black/90 justify-center items-center px-6 z-50">
                        <View className={`w-full p-8 rounded-[45px] border shadow-2xl ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-[#F2E7D5] border-[#B08D6D]'}`}>
                            <Text className={`font-black text-center mb-6 tracking-widest uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-black'}`}>{t.idioma}</Text>
                            <TouchableOpacity onPress={() => cambiarIdioma('es')} className={`p-5 mb-4 rounded-2xl border ${lang === 'es' ? (isDarkMode ? 'border-[#9DB08B] bg-[#9DB08B]/10' : 'border-[#8C977A] bg-[#8C977A]/10') : (isDarkMode ? 'border-[#35332F] bg-[#35332F]' : 'border-[#EAE9E4] bg-[#FAF9F5]')}`}><Text className={`text-center font-bold tracking-widest ${lang === 'es' ? (isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]') : (isDarkMode ? 'text-[#EAE9E4]' : 'text-black')}`}>ESPAÑOL (ES)</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => cambiarIdioma('en')} className={`p-5 rounded-2xl border ${lang === 'en' ? (isDarkMode ? 'border-[#9DB08B] bg-[#9DB08B]/10' : 'border-[#8C977A] bg-[#8C977A]/10') : (isDarkMode ? 'border-[#35332F] bg-[#35332F]' : 'border-[#EAE9E4] bg-[#FAF9F5]')}`}><Text className={`text-center font-bold tracking-widest ${lang === 'en' ? (isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]') : (isDarkMode ? 'text-[#EAE9E4]' : 'text-black')}`}>ENGLISH (EN)</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setLangModalVisible(false)} className="mt-8"><Text className={`font-black text-center tracking-widest text-[10px] uppercase ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.cancelar}</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={selectorModalVisible} transparent animationType="slide">
                    <View className="flex-1 bg-black/80 justify-end z-50">
                        <View className={`h-[60%] rounded-t-[50px] p-8 shadow-2xl ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}>
                            <Text className={`font-black text-center mb-6 tracking-widest uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{selectorType === 'carrera' ? t.carrera : t.grupo}</Text>
                            <FlatList data={selectorType === 'carrera' ? carreras : grupos} keyExtractor={(item) => String(item.id)} showsVerticalScrollIndicator={false} renderItem={({ item }) => (
                                <TouchableOpacity className={`py-6 border-b ${isDarkMode ? 'border-[#4A4843]' : 'border-[#EAE9E4]'}`} onPress={() => { if (selectorType === 'carrera') { setCarreraId(item.id); setGrupoId(''); } else { setGrupoId(item.id); } setSelectorModalVisible(false); }}><Text className={`text-center text-lg font-bold ${isDarkMode ? 'text-[#EAE9E4]' : 'text-black'}`}>{item.nombre}</Text></TouchableOpacity>
                            )} />
                            <TouchableOpacity className={`mt-6 p-5 rounded-full items-center shadow-lg ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`} onPress={() => setSelectorModalVisible(false)}><Text className={`font-black tracking-widest ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.cancelar}</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <SafeAreaView className="flex-1 z-10">
                    <View className="flex-row justify-between items-center mb-2 mt-2 px-6">
                        <View className="w-14" />
                        <Animated.Image source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')} style={{ width: 150, height: 120, opacity: logoOpacity }} resizeMode="contain" />
                        <TouchableOpacity onPress={triggerThemeChange} activeOpacity={0.9} className={`w-12 h-12 rounded-2xl items-center justify-center border shadow-sm ${isDarkMode ? 'bg-[#262422] border-[#4A4843]' : 'bg-white border-[#EAE9E4]'}`}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}><Feather name={isDarkMode ? 'sun' : 'moon'} size={20} color={isDarkMode ? '#9DB08B' : '#8C977A'} /></Animated.View>
                        </TouchableOpacity>
                    </View>

                    <ScrollView ref={scrollViewRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentOffset={{ x: width, y: 0 }} onScroll={handleScroll} onMomentumScrollEnd={onMomentumScrollEnd} scrollEventThrottle={16} bounces={false}>
                        <View style={{ width }}>
                            <ScrollView contentContainerStyle={{ paddingHorizontal: width * 0.05, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                                <View className={`rounded-[40px] p-8 mb-10 shadow-xl ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}>
                                    <Text className={`font-black tracking-[4px] text-center mb-8 text-lg uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{registroCompleto ? t.act_reg : t.crear_reg}</Text>
                                    <View className="mb-6"><Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.nombre}</Text><TextInput className={`p-4 rounded-2xl text-base border-0 ${isDarkMode ? 'bg-[#35332F] text-white' : 'bg-[#FAF9F5] text-black'}`} value={nombre} onChangeText={setNombre} placeholder="..." placeholderTextColor="#888" /></View>
                                    <View className="mb-6"><Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.matricula}</Text><TextInput className={`p-4 rounded-2xl text-base border-0 ${isDarkMode ? 'bg-[#35332F] text-white' : 'bg-[#FAF9F5] text-black'}`} value={matricula} onChangeText={setMatricula} keyboardType="numeric" placeholder="00000000" placeholderTextColor="#888" /></View>
                                    <View className="mb-6"><Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.semestre}</Text><TextInput className={`p-4 rounded-2xl text-base border-0 ${isDarkMode ? 'bg-[#35332F] text-white' : 'bg-[#FAF9F5] text-black'}`} value={semestre} onChangeText={setSemestre} keyboardType="numeric" placeholder="4" placeholderTextColor="#888" /></View>
                                    <View className="mb-6"><Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.carrera}</Text><TouchableOpacity className={`p-4 rounded-2xl flex-row justify-between items-center ${isDarkMode ? 'bg-[#35332F]' : 'bg-[#FAF9F5]'}`} onPress={() => { setSelectorType('carrera'); setSelectorModalVisible(true); }}><Text className={`font-bold ${carreraId ? (isDarkMode ? 'text-[#EAE9E4]' : 'text-black') : (isDarkMode ? '#8C8A85' : 'text-zinc-500')}`}>{carreraActual ? carreraActual.nombre : t.seleccionar}</Text><Feather name="chevron-down" size={18} color={isDarkMode ? '#9DB08B' : '#8C977A'} /></TouchableOpacity></View>
                                    {carreraId ? (<View className="mb-6"><Text className={`font-bold text-[10px] mb-2 tracking-widest ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.grupo}</Text><TouchableOpacity className={`p-4 rounded-2xl flex-row justify-between items-center ${isDarkMode ? 'bg-[#35332F]' : 'bg-[#FAF9F5]'}`} onPress={() => { setSelectorType('grupo'); setSelectorModalVisible(true); }}><Text className={`font-bold ${grupoId ? (isDarkMode ? 'text-[#EAE9E4]' : 'text-black') : (isDarkMode ? '#8C8A85' : 'text-zinc-500')}`}>{grupoActual ? grupoActual.nombre : t.seleccionar}</Text><Feather name="chevron-down" size={18} color={isDarkMode ? '#9DB08B' : '#8C977A'} /></TouchableOpacity></View>) : null}
                                    <TouchableOpacity className={`p-5 rounded-full items-center shadow-lg mt-4 ${guardando ? 'bg-[#35332F]' : (isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]')}`} onPress={guardarFicha} disabled={guardando}>{guardando ? <ActivityIndicator color={isDarkMode ? "#1C1A18" : "#FFF"} /> : <Text className={`font-black tracking-[3px] uppercase ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.finalizar}</Text>}</TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>

                        <View style={{ width }}>
                            <ScrollView contentContainerStyle={{ paddingHorizontal: width * 0.05, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                                <View className={`rounded-[40px] mb-10 shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}>
                                    <TouchableOpacity onPress={manejarFoto} className={`w-full h-72 relative ${isDarkMode ? 'bg-[#35332F]' : 'bg-zinc-800'}`}>
                                        {userPhoto ? <Image source={{ uri: userPhoto }} className="w-full h-full" resizeMode="cover" /> : <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-[#35332F]' : 'bg-[#FAF9F5]'}`}><Feather name="image" size={50} color={isDarkMode ? '#9DB08B' : '#8C977A'} /><Text className={`font-black tracking-widest mt-2 ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.foto}</Text></View>}
                                        <View className="absolute inset-0 bg-black/30" />
                                        <View className="absolute bottom-10 left-6 right-6"><Text className="text-white text-3xl font-black uppercase tracking-tight" numberOfLines={1}>{nombreDisplay}</Text><Text className={`font-bold text-xs tracking-[3px] mt-1 uppercase ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#EAE9E4]'}`} numberOfLines={1}>{carreraDisplay}</Text></View>
                                    </TouchableOpacity>
                                    <View className="p-8 items-center min-h-[300px] justify-center">
                                        {!registroCompleto ? <View className="items-center px-4"><View className={`w-20 h-20 rounded-full justify-center items-center mb-6 ${isDarkMode ? 'bg-[#9DB08B]/10' : 'bg-[#8C977A]/10'}`}><Feather name="lock" size={32} color={isDarkMode ? '#9DB08B' : '#8C977A'} /></View><Text className={`font-black tracking-widest text-lg text-center mb-2 ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.pendiente}</Text><Text className={`text-center text-xs font-medium px-4 ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>{t.instruccion_ficha}</Text></View> : <View className="items-center w-full mt-4">{qrValue ? <View className="items-center w-full"><View className="p-5 bg-white rounded-[30px] shadow-2xl mb-6"><QRCode value={String(qrValue)} size={width * 0.5} color="#121212" backgroundColor="white" /></View><View className={`border px-8 py-3 rounded-full ${isDarkMode ? 'bg-[#9DB08B]/10 border-[#9DB08B]/30' : 'bg-[#8C977A]/10 border-[#8C977A]/30'}`}><Text className={`font-black tracking-widest text-[11px] ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.activo} • {timeLeft}{t.expiracion}</Text></View></View> : <TouchableOpacity className={`px-10 py-5 rounded-full shadow-2xl mt-12 ${isDarkMode ? 'bg-[#9DB08B] shadow-[#9DB08B]/40' : 'bg-[#8C977A] shadow-[#8C977A]/40'}`} onPress={generarQR} activeOpacity={0.8}><Text className={`font-black tracking-[4px] text-sm ${isDarkMode ? 'text-[#1C1A18]' : 'text-white'}`}>{t.generar}</Text></TouchableOpacity>}</View>}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>

                        <View style={{ width }}>
                            <ScrollView contentContainerStyle={{ paddingHorizontal: width * 0.05, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                                <View className="pb-10">
                                    <View className={`rounded-[40px] p-6 mb-6 items-center shadow-xl ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}>
                                        <View className="relative">
                                            <View className={`w-28 h-28 rounded-full overflow-hidden border-4 ${isDarkMode ? 'border-[#35332F] bg-[#35332F]' : 'border-[#FAF9F5] bg-[#FAF9F5]'}`}>{userPhoto ? <Image source={{ uri: userPhoto }} className="w-full h-full" resizeMode="cover" /> : <View className="flex-1 justify-center items-center"><Feather name="user" size={40} color={isDarkMode ? '#8C8A85' : '#b5b4ad'} /></View>}</View>
                                            <TouchableOpacity onPress={manejarFoto} className={`absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-4 shadow-lg ${isDarkMode ? 'bg-[#9DB08B] border-[#262422]' : 'bg-[#8C977A] border-white'}`}><Feather name="camera" size={14} color={isDarkMode ? '#1C1A18' : '#FFF'} /></TouchableOpacity>
                                        </View>
                                        <Text className={`font-black text-lg tracking-widest mt-4 uppercase ${isDarkMode ? 'text-[#EAE9E4]' : 'text-zinc-800'}`}>{nombreDisplay}</Text>
                                        <TouchableOpacity onPress={() => { setTempQuote(userQuote); setIsEditingQuote(true); }} className="mt-4 px-4"><Text className={`text-center font-medium italic leading-5 ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>"{userQuote}"</Text><View className="flex-row items-center justify-center mt-2"><Feather name="edit-2" size={12} color={isDarkMode ? '#9DB08B' : '#8C977A'} /><Text className={`font-bold text-[10px] uppercase tracking-widest ml-1 ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>{t.editar_frase}</Text></View></TouchableOpacity>
                                    </View>
                                    <View className={`rounded-[40px] p-6 mb-6 shadow-xl ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}><ConfigMenuItem icon="map-pin" text={t.direccion} onPress={abrirMapaUTVT} isLast /></View>
                                    <View className={`rounded-[40px] mb-6 shadow-xl ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}><ConfigMenuItem icon="key" text={t.passwords} onPress={() => setPassModalVisible(true)} /><ConfigMenuItem icon="message-square" text={t.idioma} onPress={() => setLangModalVisible(true)} isLast /></View>
                                    <View className={`rounded-[40px] mb-6 shadow-xl ${isDarkMode ? 'bg-[#262422]' : 'bg-white'}`}>
                                        <ConfigMenuItem icon="shield" text={t.privacidad} onPress={() => setPrivacyVisible(true)} />
                                        {/* 💥 CIERRE DE SESIÓN SEGURO */}
                                        <ConfigMenuItem icon="log-out" text={t.salir} onPress={async () => {
                                            await SecureStore.deleteItemAsync('user_session_id');
                                            await SecureStore.deleteItemAsync('saved_username');
                                            router.replace('/');
                                        }} isDanger isLast />
                                    </View>
                                    <View className="items-center pb-4 mt-2"><Text className={`font-bold text-[9px] tracking-[3px] ${isDarkMode ? 'text-[#8C8A85]' : 'text-zinc-500'}`}>V 1.0</Text><Text className={`font-black text-[10px] tracking-[4px] mt-2 ${isDarkMode ? 'text-[#9DB08B]' : 'text-[#8C977A]'}`}>QRIFY SECURE</Text></View>
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </SafeAreaView>

                {/* Status fuera de los modales (Vista principal) */}
                {!passModalVisible && !isEditingQuote && <StatusView />}

                <View style={{ width: barWidth }} className={`absolute bottom-8 self-center h-16 rounded-[30px] flex-row items-center shadow-2xl z-20 ${isDarkMode ? 'bg-[#262422]/95 border border-[#4A4843]' : 'bg-white/95 border border-[#EAE9E4]'}`}>
                    <Animated.View style={{ width: tabWidth - 16, transform: [{ translateX: indicatorTranslateX }], left: 8 }} className={`absolute h-12 rounded-[22px] z-0 ${isDarkMode ? 'bg-[#9DB08B]' : 'bg-[#8C977A]'}`} />
                    <TouchableOpacity className="flex-1 h-full justify-center items-center z-10" onPress={() => handleTabPress(0)} activeOpacity={1}><Feather name="file-text" size={20} color={activeIndex === 0 ? (isDarkMode ? '#1C1A18' : '#FFF') : (isDarkMode ? '#8C8A85' : '#A0A0A0')} /></TouchableOpacity>
                    <TouchableOpacity className="flex-1 h-full justify-center items-center z-10" onPress={() => handleTabPress(1)} activeOpacity={1}><Feather name="aperture" size={24} color={activeIndex === 1 ? (isDarkMode ? '#1C1A18' : '#FFF') : (isDarkMode ? '#8C8A85' : '#A0A0A0')} /></TouchableOpacity>
                    <TouchableOpacity className="flex-1 h-full justify-center items-center z-10" onPress={() => handleTabPress(2)} activeOpacity={1}><Feather name="sliders" size={20} color={activeIndex === 2 ? (isDarkMode ? '#1C1A18' : '#FFF') : (isDarkMode ? '#8C8A85' : '#A0A0A0')} /></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}