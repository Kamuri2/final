import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View,
    Dimensions, Animated, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
    Keyboard, StatusBar, ScrollView, Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

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

export default function ForgotPasswordScreen() {
    const { theme, isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
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
        if (!email.trim().includes('@')) return showStatus('INGRESA UN CORREO VÁLIDO', 'error');
        try {
            await solicitarPin({ variables: { email: email.trim().toLowerCase() } });
            if (isMounted.current) {
                showStatus('CODIGO ENVIADO', 'success');
                setTimeout(() => {
                    if (isMounted.current) setStep(2);
                }, 1000);
            }
        } catch (e: any) {
            if (isMounted.current) showStatus('CORREO NO REGISTRADO', 'error');
        }
    };

    const handleReset = async () => {
        if (pin.length < 6 || newPassword.length < 4) return showStatus('DATOS INCOMPLETOS', 'error');
        try {
            const { data } = await resetearPass({
                variables: {
                    email: email.trim().toLowerCase(),
                    pin: pin.trim(),
                    nuevaPassword: newPassword
                }
            });
            if (data && isMounted.current) {
                showStatus('CONTRASEÑA ACTUALIZADA', 'success');
                setTimeout(() => {
                    if (isMounted.current) router.replace('/' as any);
                }, 2000);
            }
        } catch (e: any) {
            if (isMounted.current) showStatus('PIN INCORRECTO O CADUCADO', 'error');
        }
    };

    const goBackSafe = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/' as any);
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* --- DECORACIÓN SUPERIOR AL ESTILO LOGIN --- */}
            <View style={styles.diagonalWrapper} pointerEvents="none">
                <View style={[styles.diagonalShape, { backgroundColor: isDarkMode ? '#1A1A1A' : '#B08D6D' }]} />
                <View style={styles.headerTextContainer}>

                    {/* LOGO DINÁMICO */}
                    <Image
                        source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />

                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#B08D6D' : '#FFF' }]}>RECUPERAR                               CONTRASEÑA</Text>
                    <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFF' : '#F2E7D5' }]}>PASO  {step}/2</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Animated.View style={{ flex: 1, opacity: fadeEntrance, transform: [{ translateY: slideEntrance }] }}>
                            <View style={styles.topSpacer} />

                            {step === 1 ? (
                                <View>
                                    <Text style={[styles.sectionLabel, { color: theme.subtext }]}>INGRESA EL CORREO ELECTRÓNICO ASOCIADO A TU CUENTA</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputTitle, { color: theme.subtext }]}>CORREO ELECTRÓNICO</Text>
                                        <TextInput
                                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                            placeholder="ejemplo@gmail.com"
                                            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.mainBtn, loadingPin && { opacity: 0.7 }]}
                                        onPress={handleSolicitar}
                                        disabled={loadingPin}
                                        activeOpacity={0.8}
                                    >
                                        {loadingPin ? <ActivityIndicator color="#000" /> : <Text style={styles.mainBtnText}>CONTINUAR</Text>}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text style={[styles.sectionLabel, { color: theme.subtext }]}>RESTABLECER CREDENCIALES</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputTitle, { color: theme.subtext }]}>CÓDIGO DE SEGURIDAD (6 DÍGITOS)</Text>
                                        <TextInput
                                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                            placeholder="000000"
                                            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                            value={pin}
                                            onChangeText={setPin}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputTitle, { color: theme.subtext }]}>NUEVA CONTRASEÑA</Text>
                                        <TextInput
                                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                                            placeholder="••••••••"
                                            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                                            secureTextEntry
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.mainBtn, loadingReset && { opacity: 0.7 }]}
                                        onPress={handleReset}
                                        disabled={loadingReset}
                                        activeOpacity={0.8}
                                    >
                                        {loadingReset ? <ActivityIndicator color="#000" /> : <Text style={styles.mainBtnText}>CONFIRMAR</Text>}
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                                        <Text style={[styles.backBtnText, { color: theme.subtext }]}>¿CÓDIGO EXPIRADO? <Text style={styles.accentText}>REINTENTAR</Text></Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity onPress={goBackSafe} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>CANCELAR</Text>
                            </TouchableOpacity>

                        </Animated.View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* SHEET DE STATUS(NOTIFICACIONES) */}
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

    // HEADER
    headerTextContainer: { position: 'absolute', top: height * 0.04, width: width, alignItems: 'center' },
    logoImage: { width: normalize(320), height: normalize(180), marginBottom: normalize(-15) },
    headerTitle: { fontSize: normalize(32), textAlign: 'center', fontWeight: '900', letterSpacing: 6, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    headerSubtitle: { fontSize: normalize(8), fontWeight: '700', letterSpacing: 4, opacity: 0.8 },

    topSpacer: { height: height * 0.38 },
    sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 25 },

    // INPUTS
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

    // BOTONES
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

    backBtn: { marginTop: 30, alignItems: 'center' },
    backBtnText: { fontSize: 9, letterSpacing: 1, fontWeight: '700' },

    cancelBtn: { marginTop: 40, alignItems: 'center' },
    cancelBtnText: { color: '#FF4D4D', fontWeight: '900', fontSize: 10, letterSpacing: 2 },

    accentText: { color: '#B08D6D', fontWeight: '900' },

    // BOTTOM SHEET
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