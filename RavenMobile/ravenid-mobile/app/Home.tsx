import { gql, useQuery, useMutation } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Image,
    ScrollView, Alert, Dimensions, Animated, Pressable, Platform,
    SafeAreaView, StatusBar
} from 'react-native';
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

    const isMounted = useRef(true);
    const slideAnim = useRef(new Animated.Value(width)).current;

    const { data, loading } = useQuery(GET_STATUS, {
        variables: { id: userId || 0 },
        skip: !userId,
        fetchPolicy: 'cache-and-network'
    });

    const [crearCredencial] = useMutation(GENERAR_QR);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (userId) {
            AsyncStorage.getItem(`photo_${userId}`).then(photo => {
                if (photo && isMounted.current) setUserPhoto(photo);
            }).catch(() => console.log("Error foto"));
        }
    }, [userId]);

    // Lógica QR
    useEffect(() => {
        let timer: any = null;
        if (qrValue) {
            timer = setInterval(() => {
                if (!isMounted.current) return;
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (cycle < 1) {
                            refrescarQR();
                            return 30;
                        } else {
                            setQrValue(null);
                            setCycle(0);
                            return 0;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timer) clearInterval(timer); };
    }, [qrValue, cycle]);

    const generarQR = async () => {
        if (!userId) return;
        try {
            const { data: res } = await crearCredencial({ variables: { usuarioId: userId } });
            if (res?.generarCredencial?.qr_hash && isMounted.current) {
                setQrValue(res.generarCredencial.qr_hash);
                setCycle(0);
                setTimeLeft(30);
            }
        } catch (e) { Alert.alert("RavenID", "Servidor no disponible."); }
    };

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

    const manejarFoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return Alert.alert("Permisos", "Se requiere galería.");
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true, aspect: [1, 1], quality: 0.4,
            });
            if (!result.canceled && result.assets[0].uri && isMounted.current) {
                setUserPhoto(result.assets[0].uri);
                await AsyncStorage.setItem(`photo_${userId}`, result.assets[0].uri);
            }
        } catch (e) { Alert.alert("Error", "Fallo al cargar imagen."); }
    };

    const toggleMenu = (open: boolean) => {
        setIsMenuOpen(open);
        Animated.timing(slideAnim, { toValue: open ? width * 0.3 : width, duration: 250, useNativeDriver: true }).start();
    };

    if (loading && !data) return <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}><ActivityIndicator color={theme.primary} size="large" /></View>;

    // --- MAPEO DE DATOS SEGURO ---
    const status = data?.getUsuarioStatus || {};
    const registroCompleto = status?.registro_completo === true;
    const alumnoBase = Array.isArray(status?.alumnos) ? status.alumnos[0] : status?.alumnos;
    const alumno = alumnoBase || {};

    const nombreDisplay = alumno?.nombre_completo || status?.username || "Usuario";
    const carreraDisplay = registroCompleto ? (alumno?.carrera || "INGENIERÍA") : "PENDIENTE";
    const semestreDisplay = registroCompleto ? (alumno?.semestre ? `${alumno.semestre}°` : "N/A") : "---";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {isMenuOpen && <Pressable style={styles.overlay} onPress={() => toggleMenu(false)}><View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} /></Pressable>}

            <Animated.View style={[styles.sidebar, { backgroundColor: theme.cardBg, transform: [{ translateX: slideAnim }] }]}>
                <Text style={[styles.sidebarTitle, { color: theme.text }]}>AJUSTES</Text>
                <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}><Text style={{ color: theme.text }}>Modo {isDarkMode ? 'Claro ☀️' : 'Oscuro 🌙'}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={() => router.replace('/')}><Text style={{ color: '#FF5E5E', fontWeight: 'bold' }}>Cerrar Sesión 🚪</Text></TouchableOpacity>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => toggleMenu(true)} style={[styles.iconBox, { backgroundColor: theme.cardBg }]}><Text style={{ fontSize: normalize(18) }}>⚙️</Text></TouchableOpacity>
                    <Text style={[styles.appName, { color: theme.text }]}>RavenID</Text>
                    <View style={styles.iconBoxPlaceholder} />
                </View>

                {/* QR CARD */}
                <View style={[styles.qrCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    {!registroCompleto ? (
                        <View style={styles.center}>
                            <Text style={{ fontSize: normalize(45) }}>🔒</Text>
                            <Text style={{ color: theme.subtext, marginTop: 15, fontWeight: 'bold', textAlign: 'center' }}>EXPEDIENTE INCOMPLETO</Text>
                        </View>
                    ) : qrValue ? (
                        <View style={styles.center}>
                            <QRCode value={String(qrValue)} size={normalize(180)} color={theme.text} backgroundColor="transparent" />
                            <Text style={[styles.qrStatus, { color: theme.primary }]}>CÓDIGO ACTIVO ✓</Text>
                            <Text style={{ color: theme.subtext, fontSize: 10 }}>Expira en {timeLeft}s</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={[styles.btnAction, { backgroundColor: theme.primary }]} onPress={generarQR}>
                            <Text style={styles.btnText}>GENERAR QR DE ACCESO</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* PERFIL */}
                <View style={[styles.profileCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <TouchableOpacity onPress={manejarFoto} style={[styles.avatarFrame, { borderColor: theme.primary }]}>
                        {userPhoto ? <Image source={{ uri: userPhoto }} style={styles.fullPhoto} /> : <Text style={{ color: theme.subtext, fontSize: 8 }}>FOTO</Text>}
                    </TouchableOpacity>
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{nombreDisplay}</Text>
                        <Text style={styles.statusLabel}>ESTUDIANTE ACTIVO • UTVT</Text>
                    </View>
                </View>

                {/* BENTO GRID CON BOTÓN DINÁMICO */}
                <View style={styles.bentoGrid}>
                    <View style={styles.row}>
                        <View style={[styles.smallBento, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                            <Text style={styles.bentoLabel}>CARRERA</Text>
                            <Text style={[styles.bentoValue, { color: theme.text }]} numberOfLines={1}>{carreraDisplay}</Text>
                        </View>
                        <View style={[styles.smallBento, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                            <Text style={styles.bentoLabel}>SEMESTRE</Text>
                            <Text style={[styles.bentoValue, { color: theme.text }]}>{semestreDisplay}</Text>
                        </View>
                    </View>

                    {/* 🚀 BOTÓN CONDICIONAL BLINDADO */}
                    <TouchableOpacity
                        style={[
                            styles.mainAction,
                            { backgroundColor: registroCompleto ? theme.primary : '#8fd58aff' } // Naranja si falta registro, Verde/Primary si ya está
                        ]}
                        onPress={() => router.push({ pathname: '/Formulario', params: { id: userId } } as any)}
                    >
                        <Text style={styles.mainActionText}>
                            {registroCompleto ? "ACTUALIZAR INFORMACION" : "COMPLETAR REGISTRO"}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center' },
    scrollContent: { paddingHorizontal: normalize(25), paddingBottom: normalize(40) },
    overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
    sidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: width * 0.7, zIndex: 20, padding: 30, elevation: 15 },
    sidebarTitle: { fontSize: normalize(18), fontWeight: 'bold', marginTop: height * 0.08, marginBottom: 20 },
    menuItem: { paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: '#88888830' },
    topBar: { marginTop: Platform.OS === 'android' ? 30 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    iconBoxPlaceholder: { width: 45 },
    appName: { fontSize: normalize(22), fontWeight: '900', letterSpacing: 1 },
    qrCard: { padding: normalize(25), borderRadius: 30, borderWidth: 1, marginBottom: 20, minHeight: normalize(280), justifyContent: 'center' },
    profileCard: { flexDirection: 'row', padding: 18, borderRadius: 25, borderWidth: 1, marginBottom: 15, alignItems: 'center' },
    avatarFrame: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    fullPhoto: { width: '100%', height: '100%' },
    userName: { fontSize: normalize(17), fontWeight: '900' },
    statusLabel: { fontSize: 9, color: '#2ecc71', fontWeight: 'bold', marginTop: 2 },
    qrStatus: { marginTop: 10, fontWeight: 'bold', letterSpacing: 1, fontSize: 12 },
    bentoGrid: { marginBottom: 20 },
    row: { flexDirection: 'row', gap: 15, marginBottom: 15 },
    smallBento: { flex: 1, padding: 18, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
    bentoLabel: { fontSize: 8, color: '#999', fontWeight: 'bold', marginBottom: 5 },
    bentoValue: { fontWeight: '900', fontSize: normalize(11), textAlign: 'center' },
    btnAction: { padding: 18, borderRadius: 15, width: '100%', alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    mainAction: {
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5
    },
    mainActionText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1, fontSize: 13 }
});