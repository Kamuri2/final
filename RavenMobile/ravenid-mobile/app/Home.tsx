import { gql, useQuery, useMutation } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Image,
    Animated, Platform, StatusBar, Modal, TextInput, FlatList, KeyboardAvoidingView,
    Dimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

// QUERIES Y MUTATIONS 
const GET_STATUS = gql`
  query GetStatus($id: Int!) {
    getUsuarioStatus(id: $id) {
      id username registro_completo 
      alumnos { nombre_completo matricula carrera semestre }
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

export default function HomeScreen() {
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;
    const { isDarkMode, toggleTheme, theme } = useTheme();

    //  ESTADO ESTILO SPA
    const [activeView, setActiveView] = useState<'ficha' | 'home' | 'config'>('home');

    // ANIMACIÓN GOTA TRACKER 
    const barWidth = width * 0.85;
    const tabWidth = barWidth / 3;
    const indicatorAnim = useRef(new Animated.Value(1)).current;

    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [cycle, setCycle] = useState(0);
    const [privacyVisible, setPrivacyVisible] = useState(false);

    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [semestre, setSemestre] = useState('');
    const [carreraId, setCarreraId] = useState('');
    const [grupoId, setGrupoId] = useState('');

    const [selectorModalVisible, setSelectorModalVisible] = useState(false);
    const [selectorType, setSelectorType] = useState<'carrera' | 'grupo' | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const sheetAnim = useRef(new Animated.Value(height)).current;

    const { data, loading, refetch: refetchStatus } = useQuery(GET_STATUS, { variables: { id: userId || 0 }, skip: !userId, fetchPolicy: 'cache-and-network' });
    const { data: carrerasData } = useQuery(GET_CARRERAS, { fetchPolicy: 'cache-and-network' });
    const [crearCredencial] = useMutation(GENERAR_QR);
    const [actualizar, { loading: guardando }] = useMutation(ACTUALIZAR);

    const carreras = carrerasData?.carreras || [];
    const carreraActual = useMemo(() => carreras.find((c: any) => String(c.id) === String(carreraId)), [carreras, carreraId]);
    const grupos = carreraActual?.grupos || [];
    const grupoActual = useMemo(() => grupos.find((g: any) => String(g.id) === String(grupoId)), [grupos, grupoId]);

    useEffect(() => {
        isMounted.current = true;
        Animated.timing(fadeEntrance, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (userId) {
            AsyncStorage.getItem(`photo_${userId}`).then(p => p && isMounted.current && setUserPhoto(p));
        }
    }, [userId]);

    useEffect(() => {
        let timer: any = null;
        if (qrValue) {
            timer = setInterval(() => {
                if (!isMounted.current) return;
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        cycle < 1 ? refrescarQR() : setQrValue(null);
                        return 30;
                    }
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

    const refrescarQR = async () => {
        if (!userId) return;
        try {
            const { data: res } = await crearCredencial({ variables: { usuarioId: userId } });
            if (res?.generarCredencial?.qr_hash && isMounted.current) { setQrValue(res.generarCredencial.qr_hash); setCycle(1); }
        } catch (e) { if (isMounted.current) setQrValue(null); }
    };

    const generarQR = async () => {
        if (!userId) return;
        try {
            const { data: res } = await crearCredencial({ variables: { usuarioId: userId } });
            if (res?.generarCredencial?.qr_hash && isMounted.current) { setQrValue(res.generarCredencial.qr_hash); setCycle(0); setTimeLeft(30); }
        } catch (e) { console.log("Error QR"); }
    };

    const manejarFoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.4 });
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
            await actualizar({
                variables: { id: userId, input: { id: userId, nombre_completo: nombre.trim(), matricula: matricula.trim(), carrera: carreraActual?.nombre || '', semestre: sInt, grupo_id: gInt, registro_completo: true } }
            });
            showStatus("REGISTRO EXITOSO", "success");
            await refetchStatus();
            setTimeout(() => { if (isMounted.current) handleTabPress('home', 1); }, 1500);
        } catch (e) { showStatus("ERROR DE SERVIDOR", "error"); }
    };

    const handleTabPress = (tab: 'ficha' | 'home' | 'config', index: number) => {
        setActiveView(tab);
        Animated.spring(indicatorAnim, {
            toValue: index,
            friction: 6,
            tension: 40,
            useNativeDriver: true
        }).start();
    };

    const indicatorTranslateX = indicatorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, tabWidth, tabWidth * 2]
    });

    const rawData = data?.getUsuarioStatus || {};
    const registroCompleto = !!rawData.registro_completo;
    const alumnosArr = rawData.alumnos;
    const alumno = Array.isArray(alumnosArr) && alumnosArr.length > 0 ? alumnosArr[0] : (alumnosArr || null);

    const nombreDisplay = alumno?.nombre_completo || rawData.username || "Usuario";
    const carreraDisplay = alumno?.carrera || (registroCompleto ? "CARGANDO..." : "NO ASIGNADA");
    const semestreDisplay = alumno?.semestre ? `${alumno.semestre}°` : (registroCompleto ? "..." : "---");

    if (loading && !data) return <View style={[styles.container, { backgroundColor: '#121212', justifyContent: 'center' }]}><ActivityIndicator color="#B08D6D" size="large" /></View>;

    const renderHomeView = () => (
        <View style={[styles.idCardContainer, { backgroundColor: isDarkMode ? 'rgba(20,20,20,0.8)' : '#FFF', borderColor: isDarkMode ? '#B08D6D44' : theme.border }]}>
            <View style={styles.idCardHeader}>
                <TouchableOpacity onPress={manejarFoto} style={styles.avatarFrame}>
                    {userPhoto ? <Image source={{ uri: userPhoto }} style={styles.fullPhoto} /> : <Text style={{ color: theme.subtext, fontSize: 10, fontWeight: '900' }}>FOTO</Text>}
                </TouchableOpacity>
                <View style={styles.idCardInfo}>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{nombreDisplay}</Text>
                    <Text style={styles.carreraText} numberOfLines={1}>{carreraDisplay}</Text>
                    <Text style={styles.statusLabel}>SEMESTRE: {semestreDisplay} • UTVT</Text>
                </View>
            </View>

            <View style={[styles.divider, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

            <View style={styles.qrZone}>
                {!registroCompleto ? (
                    <View style={styles.center}>
                        <View style={styles.lockIconContainer}><Feather name="lock" size={32} color="#B08D6D" /></View>
                        <Text style={styles.lockText}>IDENTIDAD PENDIENTE</Text>
                        <Text style={[styles.lockSubtext, { color: theme.subtext }]}>Completa tu registro en la pestaña de "Ficha".</Text>
                    </View>
                ) : (
                    <View style={styles.center}>
                        {qrValue ? (
                            <>
                                <View style={styles.qrBg}>
                                    <QRCode value={String(qrValue)} size={width * 0.45} color="#121212" backgroundColor="white" />
                                </View>
                                <View style={styles.qrStatusPill}>
                                    <Text style={styles.qrStatusText}>CÓDIGO ACTIVO • {timeLeft}s</Text>
                                </View>
                            </>
                        ) : (
                            <TouchableOpacity style={styles.btnGenerar} onPress={generarQR} activeOpacity={0.8}>
                                <Text style={styles.btnGenerarText}>GENERAR ACCESO</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );

    const renderFichaView = () => (
        <View style={[styles.idCardContainer, { backgroundColor: isDarkMode ? 'rgba(20,20,20,0.8)' : '#FFF', borderColor: isDarkMode ? '#B08D6D44' : theme.border }]}>
            <Text style={[styles.sectionTitle, { color: '#B08D6D', textAlign: 'center', marginBottom: 25 }]}>
                {registroCompleto ? 'ACTUALIZAR REGISTRO' : 'CREAR REGISTRO'}
            </Text>
            <View style={styles.inputGroup}>
                <Text style={[styles.inputTitle, { color: theme.text }]}>NOMBRE COMPLETO</Text>
                <TextInput style={[styles.inputBlock, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFF', color: theme.text, borderColor: isDarkMode ? '#B08D6D44' : theme.border }]} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" placeholderTextColor={theme.subtext} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={[styles.inputTitle, { color: theme.text }]}>MATRÍCULA</Text>
                <TextInput style={[styles.inputBlock, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFF', color: theme.text, borderColor: isDarkMode ? '#B08D6D44' : theme.border }]} value={matricula} onChangeText={setMatricula} keyboardType="numeric" placeholder="00000000" placeholderTextColor={theme.subtext} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={[styles.inputTitle, { color: theme.text }]}>SEMESTRE</Text>
                <TextInput style={[styles.inputBlock, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFF', color: theme.text, borderColor: isDarkMode ? '#B08D6D44' : theme.border }]} value={semestre} onChangeText={setSemestre} keyboardType="numeric" placeholder="Ej: 4" placeholderTextColor={theme.subtext} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={[styles.inputTitle, { color: theme.text }]}>CARRERA ACADÉMICA</Text>
                <TouchableOpacity style={[styles.inputBlock, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: isDarkMode ? '#B08D6D44' : theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => { setSelectorType('carrera'); setSelectorModalVisible(true); }}>
                    <Text style={{ color: carreraId ? theme.text : theme.subtext, fontSize: 14, fontWeight: '700' }}>{carreraActual ? carreraActual.nombre : "-- Seleccionar --"}</Text>
                    <Feather name="chevron-down" size={16} color="#B08D6D" />
                </TouchableOpacity>
            </View>
            {carreraId !== '' && (
                <View style={styles.inputGroup}>
                    <Text style={[styles.inputTitle, { color: theme.text }]}>GRUPO</Text>
                    <TouchableOpacity style={[styles.inputBlock, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: isDarkMode ? '#B08D6D44' : theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => { setSelectorType('grupo'); setSelectorModalVisible(true); }}>
                        <Text style={{ color: grupoId ? theme.text : theme.subtext, fontSize: 14, fontWeight: '700' }}>{grupoActual ? grupoActual.nombre : "-- Seleccionar --"}</Text>
                        <Feather name="chevron-down" size={16} color="#B08D6D" />
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity style={[styles.btnGenerar, { marginTop: 20 }]} onPress={guardarFicha} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#000" /> : <Text style={styles.btnGenerarText}>FINALIZAR REGISTRO</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderConfigView = () => (
        <View style={[styles.idCardContainer, { backgroundColor: isDarkMode ? 'rgba(20,20,20,0.8)' : '#FFF', borderColor: isDarkMode ? '#B08D6D44' : theme.border, minHeight: height * 0.5 }]}>
            <Text style={[styles.sectionTitle, { color: '#B08D6D', textAlign: 'center', marginBottom: 30 }]}>AJUSTES</Text>
            <TouchableOpacity style={styles.configItem} onPress={() => setPrivacyVisible(true)}>
                <Feather name="shield" size={20} color={theme.text} style={{ marginBottom: 8 }} />
                <Text style={{ color: theme.text, fontWeight: '900', letterSpacing: 1 }}>PRIVACIDAD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.configItem, { borderBottomWidth: 0, marginTop: 10 }]} onPress={() => router.replace('/')}>
                <Feather name="log-out" size={20} color="#FF4D4D" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#FF4D4D', fontWeight: '900', letterSpacing: 1 }}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 'auto', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#666', fontWeight: '900', letterSpacing: 2 }}>V 1.0</Text>
                <Text style={{ fontSize: 9, color: '#B08D6D', fontWeight: '900', letterSpacing: 2, marginTop: 5 }}>QRIFY SECURE</Text>
            </View>
        </View>
    );

    const renderSelectItem = ({ item }: any) => (
        <TouchableOpacity style={[styles.selectItem, { borderBottomColor: isDarkMode ? 'rgba(176,141,109,0.2)' : theme.border }]} onPress={() => { if (selectorType === 'carrera') { setCarreraId(item.id); setGrupoId(''); } else { setGrupoId(item.id); } setSelectorModalVisible(false); }}>
            <Text style={[styles.selectItemText, { color: theme.text }]}>{item.nombre}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.diagonalWrapper} pointerEvents="none">
                <View style={[styles.diagonalShape, { backgroundColor: isDarkMode ? '#1A1A1A' : '#B08D6D' }]} />
            </View>

            <Modal visible={privacyVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F2E7D5', borderColor: '#B08D6D', borderWidth: 1 }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? '#B08D6D' : '#121212' }]}>PRIVACIDAD QRIFY</Text>
                        <Text style={[styles.modalBody, { color: isDarkMode ? '#FFF' : '#121212' }]}>Tus datos académicos están blindados. El sistema solo utiliza tu información para generar accesos seguros.{"\n\n"}No compartimos tu matrícula con terceros.</Text>
                        <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setPrivacyVisible(false)}><Text style={styles.btnCerrarText}>ENTENDIDO</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={selectorModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F2E7D5', borderColor: '#B08D6D', borderWidth: 1 }]}>
                        <Text style={[styles.modalTitle, { color: '#B08D6D' }]}>{selectorType === 'carrera' ? 'SELECCIONA CARRERA' : 'SELECCIONA GRUPO'}</Text>
                        <FlatList data={selectorType === 'carrera' ? carreras : grupos} renderItem={renderSelectItem} keyExtractor={(item) => String(item.id)} style={{ maxHeight: height * 0.4 }} showsVerticalScrollIndicator={false} />
                        <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setSelectorModalVisible(false)}><Text style={styles.btnCerrarText}>CANCELAR</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <SafeAreaView style={{ flex: 1 }}>
                <Animated.ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false} style={{ opacity: fadeEntrance }} bounces={false} keyboardShouldPersistTaps="handled">

                    {/* 🚀 TOP BAR CON LOGO DINÁMICO */}
                    <View style={styles.topBar}>
                        <View style={{ width: 45 }} />
                        {/* Renderizado condicional del Logo según el modo oscuro */}
                        <Image
                            source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: isDarkMode ? '#B08D6D55' : theme.border }]}>
                            <Feather name={isDarkMode ? 'sun' : 'moon'} size={20} color={isDarkMode ? '#B08D6D' : '#333'} />
                        </TouchableOpacity>
                    </View>

                    {activeView === 'home' && renderHomeView()}
                    {activeView === 'ficha' && renderFichaView()}
                    {activeView === 'config' && renderConfigView()}
                </Animated.ScrollView>
            </SafeAreaView>

            {statusMessage && (
                <Animated.View style={[styles.premiumSheet, { transform: [{ translateY: sheetAnim }], backgroundColor: isDarkMode ? '#121212' : '#F2E7D5', borderTopColor: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
                    <View style={[styles.handle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                    <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>{statusMessage.text}</Text>
                </Animated.View>
            )}

            <View style={[styles.bottomNavBar, { backgroundColor: isDarkMode ? 'rgba(20,20,20,0.95)' : '#FFF', borderColor: isDarkMode ? '#B08D6D44' : theme.border, width: barWidth }]}>

                <Animated.View style={[
                    styles.activeDrop,
                    {
                        left: (tabWidth - 50) / 2,
                        transform: [{ translateX: indicatorTranslateX }]
                    }
                ]} />

                <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('ficha', 0)} activeOpacity={1}>
                    <Feather name="file-text" size={normalize(22)} color={activeView === 'ficha' ? '#000' : theme.subtext} style={{ zIndex: 10 }} />
                    <Text style={[styles.navText, { color: activeView === 'ficha' ? '#000' : theme.subtext, opacity: activeView === 'ficha' ? 1 : 0 }]}>FICHA</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('home', 1)} activeOpacity={1}>
                    <Feather name="aperture" size={normalize(26)} color={activeView === 'home' ? '#000' : theme.subtext} style={{ zIndex: 10 }} />
                    <Text style={[styles.navText, { color: activeView === 'home' ? '#000' : theme.subtext, opacity: activeView === 'home' ? 1 : 0 }]}>ACCESO</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress('config', 2)} activeOpacity={1}>
                    <Feather name="sliders" size={normalize(22)} color={activeView === 'config' ? '#000' : theme.subtext} style={{ zIndex: 10 }} />
                    <Text style={[styles.navText, { color: activeView === 'config' ? '#000' : theme.subtext, opacity: activeView === 'config' ? 1 : 0 }]}>AJUSTES</Text>
                </TouchableOpacity>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { paddingHorizontal: width * 0.06 },

    diagonalWrapper: { position: 'absolute', top: 0, width: width, height: height * 0.35, zIndex: 0 },
    diagonalShape: { position: 'absolute', top: -height * 0.15, left: -width * 0.2, width: width * 1.5, height: height * 0.35, transform: [{ rotate: '-10deg' }], elevation: 5 },

    topBar: { marginTop: Platform.OS === 'android' ? 10 : 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    logoImage: { width: normalize(240), height: normalize(160) },
    themeBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    idCardContainer: { borderRadius: 35, padding: 25, marginBottom: 30, borderWidth: 1, shadowColor: '#B08D6D', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    idCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarFrame: { width: normalize(75), height: normalize(75), borderRadius: normalize(25), borderWidth: 2, borderColor: '#B08D6D', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
    fullPhoto: { width: '100%', height: '100%' },
    idCardInfo: { marginLeft: 15, flex: 1, justifyContent: 'center' },
    userName: { fontSize: normalize(18), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    carreraText: { fontSize: normalize(10), color: '#B08D6D', fontWeight: '800', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
    statusLabel: { fontSize: normalize(8), opacity: 0.6, fontWeight: '700', marginTop: 4, letterSpacing: 1.5, color: '#888' },
    divider: { borderBottomWidth: 1, marginBottom: 25, marginHorizontal: -10 },

    qrZone: { flex: 1, alignItems: 'center', minHeight: height * 0.35, justifyContent: 'center' },
    qrBg: { backgroundColor: '#FFF', padding: 15, borderRadius: 25, elevation: 15, shadowColor: '#B08D6D', shadowOpacity: 0.3, shadowRadius: 15 },
    qrStatusPill: { backgroundColor: 'rgba(176,141,109,0.15)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 25, borderWidth: 1, borderColor: 'rgba(176,141,109,0.3)' },
    qrStatusText: { fontWeight: '900', letterSpacing: 2, fontSize: 10, color: '#B08D6D' },
    btnGenerar: { backgroundColor: '#B08D6D', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20, elevation: 8, shadowColor: '#B08D6D', shadowOpacity: 0.4, shadowRadius: 10, alignItems: 'center' },
    btnGenerarText: { color: '#000', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
    lockIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(176,141,109,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    lockText: { color: '#B08D6D', fontWeight: '900', letterSpacing: 2, fontSize: 14 },
    lockSubtext: { fontSize: 10, marginTop: 8, textAlign: 'center', paddingHorizontal: 20, lineHeight: 16 },

    inputGroup: { marginBottom: 18 },
    inputTitle: { fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 2 },
    inputBlock: { padding: normalize(15), borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#B08D6D', borderWidth: 1, fontWeight: '600' },

    sectionTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 3, marginBottom: 15 },
    configItem: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(176,141,109,0.2)', alignItems: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.85, padding: 35, borderRadius: 35, elevation: 20 },
    modalTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 20 },
    modalBody: { fontSize: 12, lineHeight: 22, textAlign: 'center', fontWeight: '600', opacity: 0.8 },
    btnCerrarModal: { backgroundColor: '#B08D6D', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 25 },
    btnCerrarText: { color: '#000', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
    selectItem: { paddingVertical: 18, borderBottomWidth: 0.5 },
    selectItemText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },

    premiumSheet: { position: 'absolute', bottom: 0, width: width, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 60 : 40, minHeight: height * 0.15, alignItems: 'center', zIndex: 9999, borderTopWidth: 2, elevation: 25 },
    handle: { width: 50, height: 5, borderRadius: 3, marginBottom: 25 },
    sheetStatusText: { fontSize: normalize(14), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },

    bottomNavBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 35 : 20,
        alignSelf: 'center',
        height: 70,
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        elevation: 15,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        overflow: 'hidden'
    },
    activeDrop: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#B08D6D',
        zIndex: 0,
        shadowColor: '#B08D6D',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5
    },
    navItem: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    navText: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
        marginTop: 4,
        position: 'absolute',
        bottom: 8
    }
});