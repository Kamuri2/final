import { gql, useQuery, useMutation } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Image,
    ScrollView, Dimensions, Animated, Pressable, Platform,
    StatusBar, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

const GET_STATUS = gql`
  query GetStatus($id: Int!) {
    getUsuarioStatus(id: $id) {
      id username registro_completo 
      alumnos { nombre_completo carrera semestre }
    }
  }
`;

const GENERAR_QR = gql`
  mutation GenerarQR($usuarioId: Int!) {
    generarCredencial(usuarioId: $usuarioId) { qr_hash }
  }
`;

export default function HomeScreen() {
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;
    const { isDarkMode, toggleTheme, theme } = useTheme();

    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [cycle, setCycle] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);

    const isMounted = useRef(true);
    const sidebarAnim = useRef(new Animated.Value(width)).current;
    const fadeEntrance = useRef(new Animated.Value(0)).current;

    const { data, loading } = useQuery(GET_STATUS, {
        variables: { id: userId || 0 },
        skip: !userId,
        fetchPolicy: 'cache-and-network',
        //pollInterval: 5000,
    });

    const [crearCredencial] = useMutation(GENERAR_QR);

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

    const refrescarQR = async () => {
        if (!userId) return;
        try {
            const { data: res } = await crearCredencial({ variables: { usuarioId: userId } });
            if (res?.generarCredencial?.qr_hash && isMounted.current) {
                setQrValue(res.generarCredencial.qr_hash);
                setCycle(1);
            }
        } catch (e) { if (isMounted.current) setQrValue(null); }
    };

    const generarQR = async () => {
        if (!userId) return;
        try {
            const { data: res } = await crearCredencial({ variables: { usuarioId: userId } });
            if (res?.generarCredencial?.qr_hash && isMounted.current) {
                setQrValue(res.generarCredencial.qr_hash);
                setCycle(0);
                setTimeLeft(30);
            }
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

    const toggleMenu = (open: boolean) => {
        setIsMenuOpen(open);
        Animated.timing(sidebarAnim, { toValue: open ? width * 0.3 : width, duration: 300, useNativeDriver: true }).start();
    };

    const rawData = data?.getUsuarioStatus || {};
    const registroCompleto = !!rawData.registro_completo;
    const alumnosArr = rawData.alumnos;
    const alumno = Array.isArray(alumnosArr) && alumnosArr.length > 0 ? alumnosArr[0] : (alumnosArr || null);

    const nombreDisplay = alumno?.nombre_completo || rawData.username || "Usuario";
    const carreraDisplay = alumno?.carrera || (registroCompleto ? "CARGANDO..." : "NO ASIGNADA");
    const semestreDisplay = alumno?.semestre ? `${alumno.semestre}°` : (registroCompleto ? "..." : "---");

    if (loading && !data) return <View style={[styles.container, { backgroundColor: '#121212', justifyContent: 'center' }]}><ActivityIndicator color="#B08D6D" size="large" /></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.diagonalWrapper} pointerEvents="none"><View style={styles.diagonalShape} /></View>

            {isMenuOpen && <Pressable style={styles.overlay} onPress={() => toggleMenu(false)}><View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} /></Pressable>}

            <Animated.View style={[styles.sidebar, { backgroundColor: theme.cardBg, transform: [{ translateX: sidebarAnim }], borderLeftColor: '#B08D6D' }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.sidebarTitle}>MENÚ</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(false); setPrivacyVisible(true); }}>
                        <Text style={{ color: theme.text, fontWeight: '700' }}>Privacidad</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { marginTop: 10 }]} onPress={() => router.replace('/')}>
                        <Text style={{ color: '#FF4D4D', fontWeight: 'bold' }}>Salir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sidebarFooter}>
                    <Text style={styles.versionText}>V 1.2.6-PRO</Text>
                    <Text style={[styles.versionText, { marginTop: 2 }]}>RavenID System</Text>
                </View>
            </Animated.View>

            <Modal visible={privacyVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: '#F2E7D5' }]}>
                        <Text style={[styles.modalTitle, { color: '#121212' }]}>PRIVACIDAD QRIFY</Text>
                        <Text style={styles.modalBody}>
                            Tus datos académicos están blindados. El sistema solo utiliza tu información para generar accesos seguros.
                            {"\n\n"}No compartimos tu matrícula con terceros. El QR expira automáticamente para tu seguridad.
                        </Text>
                        <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setPrivacyVisible(false)}>
                            <Text style={styles.btnText}>ENTENDIDO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <SafeAreaView style={{ flex: 1 }}>
                <Animated.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ opacity: fadeEntrance }} bounces={false}>

                    {/* TOP BAR CON LOGO AMPLIADO */}
                    <View style={styles.topBar}>
                        <Image
                            source={require('../assets/images/ICONO.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                            <Text style={{ fontSize: normalize(16) }}>{isDarkMode ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.qrCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        {!registroCompleto ? (
                            <View style={styles.center}>
                                <Text style={{ fontSize: normalize(50) }}>🔒</Text>
                                <Text style={styles.lockText}>ACCESO BLOQUEADO</Text>
                                <Text style={{ color: theme.subtext, fontSize: 10, marginTop: 10, textAlign: 'center' }}>Pendiente de Registro Académico</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                {qrValue ? (
                                    <>
                                        <View style={styles.qrBg}>
                                            <QRCode value={String(qrValue)} size={width * 0.42} color="#121212" backgroundColor="white" />
                                        </View>
                                        <Text style={styles.qrStatus}>CÓDIGO ACTIVO</Text>
                                        <Text style={{ color: theme.subtext, fontSize: 10 }}>Válido por {timeLeft}s</Text>
                                    </>
                                ) : (
                                    <TouchableOpacity style={styles.btnGenerar} onPress={generarQR}>
                                        <Text style={styles.btnText}>SOLICITAR ACCESO</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    <View style={[styles.profileCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <TouchableOpacity onPress={manejarFoto} style={styles.avatarFrame}>
                            {userPhoto ? <Image source={{ uri: userPhoto }} style={styles.fullPhoto} /> : <Text style={{ color: theme.subtext, fontSize: 8 }}>IMG</Text>}
                        </TouchableOpacity>
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{nombreDisplay}</Text>
                            <Text style={styles.statusLabel}>ESTUDIANTE • UTVT</Text>
                        </View>
                    </View>

                    <View style={styles.bentoGrid}>
                        <View style={styles.row}>
                            <View style={[styles.smallBento, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                <Text style={[styles.bentoLabel, { color: theme.subtext }]}>CARRERA</Text>
                                <Text style={[styles.bentoValue, { color: theme.text }]} numberOfLines={2}>{carreraDisplay}</Text>
                            </View>
                            <View style={[styles.smallBento, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                <Text style={[styles.bentoLabel, { color: theme.subtext }]}>SEMESTRE</Text>
                                <Text style={[styles.bentoValue, { color: theme.text }]}>{semestreDisplay}</Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => toggleMenu(true)} style={[styles.smallBento, { flex: 0.35, backgroundColor: theme.cardBg, borderColor: '#B08D6D', borderBottomWidth: 4 }]}>
                                <Text style={[styles.bentoLabel, { color: '#B08D6D' }]}>MÁS</Text>
                                <Text style={[styles.bentoValue, { color: theme.text, fontSize: 18 }]}>⚙️</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.mainAction, { flex: 1, backgroundColor: registroCompleto ? '#B08D6D' : theme.cardBg, borderColor: '#B08D6D', borderWidth: registroCompleto ? 0 : 1 }]}
                                onPress={() => router.push({ pathname: '/Formulario', params: { id: userId } } as any)}
                            >
                                <Text style={[styles.mainActionText, { color: registroCompleto ? '#FFF' : '#B08D6D' }]}>
                                    {registroCompleto ? "EDITAR MI INFORMACIÓN" : "REGISTRAR MI INFORMACIÓN"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center' },
    scrollContent: { paddingHorizontal: width * 0.08, paddingBottom: 40 },
    overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
    diagonalWrapper: { position: 'absolute', top: 0, width: width, height: height * 0.45, zIndex: 0 },
    diagonalShape: { position: 'absolute', top: -height * 0.15, left: -width * 0.2, width: width * 1.5, height: height * 0.45, backgroundColor: '#B08D6D', transform: [{ rotate: '-12deg' }] },

    sidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: width * 0.7, zIndex: 100, padding: 30, borderLeftWidth: 1.5 },
    sidebarTitle: { fontSize: normalize(18), fontWeight: '900', color: '#B08D6D', marginTop: 50, marginBottom: 25, letterSpacing: 3 },
    menuItem: { paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: 'rgba(136,136,136,0.15)' },
    sidebarFooter: { borderTopWidth: 0.5, borderTopColor: 'rgba(136,136,136,0.15)', paddingTop: 20 },
    versionText: { fontSize: 8, color: '#666', fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },

    topBar: { marginTop: Platform.OS === 'android' ? 5 : 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    logoImage: { width: normalize(120), height: normalize(120) }, //LOGO 
    themeBtn: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    qrCard: { padding: normalize(50), borderRadius: 28, marginBottom: 20, minHeight: height * 0.32, justifyContent: 'center', borderWidth: 1 },
    qrBg: { backgroundColor: '#FFF', padding: 12, borderRadius: 18, elevation: 10 },
    lockText: { color: '#B08D6D', marginTop: 12, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
    qrStatus: { marginTop: 12, fontWeight: '900', letterSpacing: 3, fontSize: 11, color: '#B08D6D' },
    profileCard: { flexDirection: 'row', padding: 16, borderRadius: 22, marginBottom: 15, alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#B08D6D' },
    avatarFrame: { width: 155, height: 155, borderRadius: 27.5, borderWidth: 2, borderColor: '#B08D6D', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
    fullPhoto: { width: '100%', height: '100%' },
    userName: { fontSize: normalize(26), fontWeight: '900', letterSpacing: 0.5 },
    statusLabel: { fontSize: 7, color: '#B08D6D', fontWeight: 'bold', marginTop: 3, letterSpacing: 1 },

    bentoGrid: { marginBottom: 20 },
    row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    smallBento: { flex: 1, padding: normalize(15), borderRadius: 22, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#B08D6D', justifyContent: 'center' },
    bentoLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 },
    bentoValue: { fontWeight: '900', fontSize: normalize(15), textAlign: 'center' },
    btnGenerar: { backgroundColor: '#B08D6D', padding: 16, borderRadius: 14, alignItems: 'center', width: '90%' },
    btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 11 },
    mainAction: { borderRadius: 22, alignItems: 'center', elevation: 8, shadowColor: '#B08D6D', shadowOpacity: 0.3, shadowRadius: 8, justifyContent: 'center' },
    mainActionText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 10 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.8, padding: 30, borderRadius: 30, elevation: 20 },
    modalTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 15 },
    modalBody: { fontSize: 11, lineHeight: 18, color: '#121212', textAlign: 'center', fontWeight: '600' },
    btnCerrarModal: { backgroundColor: '#121212', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 }
});