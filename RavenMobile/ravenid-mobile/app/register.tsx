import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View,
    Dimensions, Animated, KeyboardAvoidingView, Platform,
    TouchableWithoutFeedback, Keyboard, StatusBar, ScrollView, Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

const REGISTRAR = gql`
  mutation Registrar($input: CreateUsuarioSistemaInput!) { 
    registrarAlumno(input: $input) { id } 
  }
`;

export default function RegisterScreen() {
    const { theme, isDarkMode } = useTheme();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const slideEntrance = useRef(new Animated.Value(30)).current;
    const sheetAnim = useRef(new Animated.Value(height)).current;

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
            }, 3500); // 3.5 segundos para que alcancen a leer bien el error 
        }
    };

    const ejecutarRegistro = async () => {
        if (!username.trim() || !email.trim() || password.length < 4) return showStatus('LLENA TODOS LOS CAMPOS', 'error');
        if (!email.includes('@')) return showStatus('CORREO INVÁLIDO', 'error');
        if (password !== confirm) return showStatus('LAS CLAVES NO COINCIDEN', 'error');

        try {
            const { data } = await registrar({ variables: { input: { username: username.trim(), email: email.trim().toLowerCase(), password, rol_id: 2 } } });
            if (data?.registrarAlumno?.id && isMounted.current) {
                showStatus('CUENTA CREADA', 'success');
                setTimeout(() => { if (isMounted.current) router.replace('/'); }, 1500);
            }
        } catch (e: any) {
            // AQUÍ DECIMOS EL ERROR DE CORREO DUPLICADO
            const errorMsg = String(e).toLowerCase();

            // Verificamos si el backend arrojó un error de llave duplicada, email o correo
            if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('correo') || errorMsg.includes('email')) {
                showStatus('CORREO YA VINCULADO A OTRO USUARIO', 'error');
            } else {
                showStatus('FALLO EN EL SERVIDOR O DATOS INVÁLIDOS', 'error');
            }
        }
    };

    const goBackSafe = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/' as any);
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.diagonalWrapper} pointerEvents="none">
                <View style={[styles.diagonalShape, { backgroundColor: isDarkMode ? '#1A1A1A' : '#B08D6D' }]} />
                <View style={styles.headerTextContainer}>

                    <Image
                        source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />

                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#B08D6D' : '#FFF' }]}>REGISTRAR CUENTA</Text>
                    <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFF' : '#F2E7D5' }]}></Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Animated.View style={{ flex: 1, opacity: fadeEntrance, transform: [{ translateY: slideEntrance }] }}>
                            <View style={styles.topSpacer} />

                            <Text style={[styles.sectionLabel, { color: theme.subtext }]}>REGISTRAR NUEVO USUARIO</Text>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.subtext }]}>NOMBRE DE USUARIO</Text>
                                <TextInput
                                    style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="ejemploUser"
                                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.subtext }]}>CORREO ELECTRÓNICO</Text>
                                <TextInput
                                    style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    placeholder="ejemplo@gmail.com"
                                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.subtext }]}>CONTRASEÑA</Text>
                                <TextInput
                                    style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.subtext }]}>CONFIRMAR CONTRASEÑA</Text>
                                <TextInput
                                    style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                    secureTextEntry
                                    value={confirm}
                                    onChangeText={setConfirm}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.mainBtn, loading && { opacity: 0.7 }]}
                                onPress={ejecutarRegistro}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.mainBtnText}>CONTINUAR</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={goBackSafe} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>CANCELAR</Text>
                            </TouchableOpacity>

                        </Animated.View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* SHEET DE STATUS */}
            {statusMessage && (
                <Animated.View style={[
                    styles.premiumSheet,
                    {
                        transform: [{ translateY: sheetAnim }],
                        backgroundColor: isDarkMode ? '#121212' : '#F2E7D5',
                        borderTopColor: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D'
                    }
                ]}>
                    <View style={[styles.handle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                    <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
                        {statusMessage.text}
                    </Text>
                    <Text style={[styles.sheetSubText, { color: theme.subtext }]}></Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    scrollContent: { paddingHorizontal: width * 0.1, paddingBottom: 50 },

    diagonalWrapper: { position: 'absolute', top: 0, width: width, height: height * 0.45, zIndex: 0 },
    diagonalShape: {
        position: 'absolute',
        top: -height * 0.15,
        left: -width * 0.2,
        width: width * 1.5,
        height: height * 0.5,
        transform: [{ rotate: '-12deg' }],
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10
    },

    headerTextContainer: { position: 'absolute', top: height * 0.04, width: width, alignItems: 'center' },
    logoImage: { width: normalize(420), height: normalize(190), marginBottom: normalize(-15) },
    headerTitle: { fontSize: normalize(32), fontWeight: '900', textAlign: 'center', letterSpacing: 6, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    headerSubtitle: { fontSize: normalize(8), fontWeight: '700', letterSpacing: 4, opacity: 0.8 },

    topSpacer: { height: height * 0.38 },
    sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 25 },

    inputGroup: { marginBottom: 20 },
    inputTitle: { fontSize: 9, fontWeight: '800', marginBottom: 12, letterSpacing: 2 },
    inputBlock: {
        padding: normalize(15),
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#B08D6D'
    },

    mainBtn: {
        backgroundColor: '#B08D6D',
        padding: normalize(18),
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 15,
        elevation: 8,
        shadowColor: '#B08D6D',
        shadowOpacity: 0.4,
        shadowRadius: 10
    },
    mainBtnText: { color: '#000', fontWeight: '900', letterSpacing: 3, fontSize: 13 },

    cancelBtn: { marginTop: 40, alignItems: 'center' },
    cancelBtnText: { color: '#FF4D4D', fontWeight: '900', fontSize: 10, letterSpacing: 2 },

    premiumSheet: {
        position: 'absolute',
        bottom: 0,
        width: width,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 60 : 40,
        minHeight: height * 0.18,
        alignItems: 'center',
        zIndex: 9999,
        borderTopWidth: 3,
        elevation: 25
    },
    handle: { width: 50, height: 5, borderRadius: 3, marginBottom: 25 },
    sheetStatusText: { fontSize: normalize(14), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
    sheetSubText: { fontSize: 8, fontWeight: '700', marginTop: 8, letterSpacing: 2 }
});