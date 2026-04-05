import { gql, useMutation, useQuery } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
    View, Dimensions, Platform, Animated, KeyboardAvoidingView, StatusBar, Modal, FlatList
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

const GET_CARRERAS = gql`query GetCarreras { carreras { id nombre grupos { id nombre } } }`;
const ACTUALIZAR = gql`mutation Actualizar($id: Int!, $input: UpdateUsuarioSistemaInput!) { actualizarAlumno(id: $id, input: $input) { id registro_completo } }`;

export default function Formulario() {
    const { theme, isDarkMode } = useTheme();
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;

    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [semestre, setSemestre] = useState('');
    const [carreraId, setCarreraId] = useState('');
    const [grupoId, setGrupoId] = useState('');

    // Estados para los Selectores de la App
    const [modalVisible, setModalVisible] = useState(false);
    const [selectorType, setSelectorType] = useState<'carrera' | 'grupo' | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const sheetAnim = useRef(new Animated.Value(height)).current;

    const { data, loading } = useQuery(GET_CARRERAS, { fetchPolicy: 'cache-and-network' });
    const [actualizar, { loading: guardando }] = useMutation(ACTUALIZAR);

    useEffect(() => {
        isMounted.current = true;
        Animated.timing(fadeEntrance, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        return () => { isMounted.current = false; };
    }, []);

    const carreras = data?.carreras || [];
    const carreraActual = useMemo(() => carreras.find((c: any) => String(c.id) === String(carreraId)), [carreras, carreraId]);
    const grupos = carreraActual?.grupos || [];
    const grupoActual = useMemo(() => grupos.find((g: any) => String(g.id) === String(grupoId)), [grupos, grupoId]);

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 15, friction: 8, useNativeDriver: true }).start();
        setTimeout(() => {
            if (isMounted.current) Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => setStatusMessage(null));
        }, 3000);
    };

    const guardar = async () => {
        const sInt = parseInt(semestre);
        const gInt = parseInt(grupoId);
        if (!userId || !nombre.trim() || !matricula.trim() || isNaN(sInt) || isNaN(gInt)) return showStatus("DATOS INCOMPLETOS", "error");

        try {
            await actualizar({
                variables: { id: userId, input: { id: userId, nombre_completo: nombre.trim(), matricula: matricula.trim(), carrera: carreraActual?.nombre || '', semestre: sInt, grupo_id: gInt, registro_completo: true } }
            });
            showStatus("REGISTRO EXITOSO ✓", "success");
            setTimeout(() => { if (isMounted.current) router.replace({ pathname: '/Home', params: { id: userId } }); }, 1500);
        } catch (e) { showStatus("ERROR DE SERVIDOR", "error"); }
    };

    const renderSelectItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.selectItem, { borderBottomColor: theme.border }]}
            onPress={() => {
                if (selectorType === 'carrera') { setCarreraId(item.id); setGrupoId(''); }
                else { setGrupoId(item.id); }
                setModalVisible(false);
            }}
        >
            <Text style={[styles.selectItemText, { color: theme.text }]}>{item.nombre}</Text>
        </TouchableOpacity>
    );

    if (loading && !data) return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator color="#B08D6D" size="large" /></View>;

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={styles.diagonalWrapper} pointerEvents="none"><View style={styles.diagonalShape} /></View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <Animated.ScrollView style={{ flex: 1, opacity: fadeEntrance }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* 🚀 TÍTULO SOLICITADO */}
                    <View style={styles.topSpacer}>
                        <Text style={styles.mainTitle}>REGISTRO DE ALUMNOS</Text>
                        <Text style={styles.sectionLabel}>EXPEDIENTE ACADÉMICO</Text>
                    </View>

                    {/* NOMBRE */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputTitle, { color: theme.text }]}>NOMBRE COMPLETO</Text>
                        <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" placeholderTextColor={theme.subtext} />
                    </View>

                    {/* MATRÍCULA */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputTitle, { color: theme.text }]}>MATRÍCULA</Text>
                        <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} value={matricula} onChangeText={setMatricula} keyboardType="numeric" placeholder="00000000" placeholderTextColor={theme.subtext} />
                    </View>

                    {/* SEMESTRE */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputTitle, { color: theme.text }]}>SEMESTRE</Text>
                        <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} value={semestre} onChangeText={setSemestre} keyboardType="numeric" placeholder="Ej: 4" placeholderTextColor={theme.subtext} />
                    </View>

                    {/* SELECTOR CARRERA (CUSTOM) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputTitle, { color: theme.text }]}>CARRERA ACADÉMICA</Text>
                        <TouchableOpacity
                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                            onPress={() => { setSelectorType('carrera'); setModalVisible(true); }}
                        >
                            <Text style={{ color: carreraId ? theme.text : theme.subtext, fontSize: 15 }}>
                                {carreraActual ? carreraActual.nombre : "-- Seleccionar --"}
                            </Text>
                            <Text style={{ color: '#B08D6D', fontSize: 12 }}>▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* SELECTOR GRUPO (CUSTOM) */}
                    {carreraId !== '' && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputTitle, { color: theme.text }]}>GRUPO</Text>
                            <TouchableOpacity
                                style={[styles.inputBlock, { backgroundColor: theme.cardBg, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                                onPress={() => { setSelectorType('grupo'); setModalVisible(true); }}
                            >
                                <Text style={{ color: grupoId ? theme.text : theme.subtext, fontSize: 15 }}>
                                    {grupoActual ? grupoActual.nombre : "-- Seleccionar --"}
                                </Text>
                                <Text style={{ color: '#B08D6D', fontSize: 12 }}>▼</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={styles.mainBtn} onPress={guardar} disabled={guardando}>
                        {guardando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>FINALIZAR REGISTRO</Text>}
                    </TouchableOpacity>
                </Animated.ScrollView>
            </KeyboardAvoidingView>

            {/* MODAL SELECTOR BLINDADO */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: '#B08D6D' }]}>
                        <Text style={[styles.modalHeader, { color: '#B08D6D' }]}>
                            {selectorType === 'carrera' ? 'SELECCIONA CARRERA' : 'SELECCIONA GRUPO'}
                        </Text>
                        <FlatList
                            data={selectorType === 'carrera' ? carreras : grupos}
                            renderItem={renderSelectItem}
                            keyExtractor={(item) => String(item.id)}
                            style={{ maxHeight: height * 0.4 }}
                            showsVerticalScrollIndicator={false}
                        />
                        <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setModalVisible(false)}>
                            <Text style={styles.btnText}>CANCELAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* BOTTOM SHEET STATUS */}
            {statusMessage && (
                <Animated.View style={[styles.premiumSheet, { transform: [{ translateY: sheetAnim }], borderTopColor: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
                    <View style={styles.handle} />
                    <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>{statusMessage.text}</Text>
                    <Text style={styles.sheetSubText}>RavenID • Sistema de Credenciales</Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: width * 0.1, paddingBottom: 50 },
    diagonalWrapper: { position: 'absolute', top: 0, width: width, height: height * 0.45, zIndex: 0 },
    diagonalShape: { position: 'absolute', top: -height * 0.15, left: -width * 0.2, width: width * 1.5, height: height * 0.5, backgroundColor: '#B08D6D', transform: [{ rotate: '-12deg' }] },

    // TÍTULOS
    topSpacer: { height: height * 0.32, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 30 },
    mainTitle: { fontSize: normalize(26), fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: 1 },
    sectionLabel: { color: '#B08D6D', fontSize: 10, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginTop: 5 },

    inputGroup: { marginBottom: 18 },
    inputTitle: { fontSize: 9, fontWeight: '700', marginBottom: 8, letterSpacing: 2 },
    inputBlock: { padding: normalize(15), borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#B08D6D', borderWidth: 1 },
    mainBtn: { backgroundColor: '#B08D6D', padding: normalize(18), borderRadius: 8, alignItems: 'center', marginTop: 15, elevation: 10 },
    mainBtnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 13 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.85, padding: 25, borderRadius: 25, borderWidth: 1.5 },
    modalHeader: { fontSize: 14, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
    selectItem: { paddingVertical: 18, borderBottomWidth: 0.5 },
    selectItemText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
    btnCerrarModal: { marginTop: 20, padding: 15, backgroundColor: '#B08D6D', borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },

    premiumSheet: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#F2E7D5', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 60 : 40, minHeight: height * 0.18, alignItems: 'center', zIndex: 9999, borderTopWidth: 2, elevation: 25 },
    handle: { width: 50, height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 25 },
    sheetStatusText: { fontSize: normalize(16), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
    sheetSubText: { fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: '700', marginTop: 8 }
});