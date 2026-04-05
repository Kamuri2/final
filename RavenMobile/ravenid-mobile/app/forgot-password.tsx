import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar,
    ScrollView
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
            Animated.timing(fadeEntrance, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideEntrance, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();
        return () => { isMounted.current = false; };
    }, []);

    const [solicitarPin, { loading: loadingPin }] = useMutation(SOLICITAR_PIN);
    const [resetearPass, { loading: loadingReset }] = useMutation(RESETEAR_PASS);

    // --- 🛠️ FIX: FUNCIÓN DE STATUS CON AUTO-OCULTADO PARA TODO ---
    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });

        // Sube el mensaje
        Animated.spring(sheetAnim, { toValue: 0, tension: 15, friction: 8, useNativeDriver: true }).start();

        // Baja el mensaje automáticamente después de 3 segundos (Success o Error)
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
                showStatus('PIN ENVIADO', 'success');
                // Esperamos un poco a que el mensaje se vea antes de cambiar de paso
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

            <View style={styles.diagonalWrapper} pointerEvents="none">
                <View style={styles.diagonalShape} />
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>RECUPERACION</Text>
                    <Text style={styles.headerSubtitle}>PASO {step} DE 2</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View style={{ flex: 1, opacity: fadeEntrance, transform: [{ translateY: slideEntrance }] }}>
                            <View style={styles.topSpacer} />

                            {step === 1 ? (
                                <View>
                                    <Text style={styles.sectionLabel}></Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputTitle, { color: theme.text }]}>CORREO VINCULADO</Text>
                                        <TextInput
                                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]}
                                            placeholder="ejemplo@utvt.edu.mx"
                                            placeholderTextColor={theme.subtext}
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
                                    >
                                        {loadingPin ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>OBTENER CÓDIGO</Text>}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.sectionLabel}>RESTABLECER CONTRASEÑA</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputTitle, { color: theme.text }]}>CÓDIGO PIN (6 DÍGITOS)</Text>
                                        <TextInput
                                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]}
                                            placeholder="000000"
                                            placeholderTextColor={theme.subtext}
                                            value={pin}
                                            onChangeText={setPin}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputTitle, { color: theme.text }]}>NUEVA CONTRASEÑA</Text>
                                        <TextInput
                                            style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]}
                                            placeholder="••••••••"
                                            placeholderTextColor={theme.subtext}
                                            secureTextEntry
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.mainBtn, loadingReset && { opacity: 0.7 }]}
                                        onPress={handleReset}
                                        disabled={loadingReset}
                                    >
                                        {loadingReset ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>RESTABLECER AHORA</Text>}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                                        <Text style={[styles.backBtnText, { color: theme.subtext }]}>¿No llegó el PIN? <Text style={styles.accentText}>REINTENTAR</Text></Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity onPress={goBackSafe} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>CANCELAR OPERACIÓN</Text>
                            </TouchableOpacity>

                        </Animated.View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {statusMessage && (
                <Animated.View style={[styles.premiumSheet, { transform: [{ translateY: sheetAnim }], borderTopColor: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
                    <View style={styles.handle} />
                    <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
                        {statusMessage.text}
                    </Text>
                    <Text style={styles.sheetSubText}></Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    scrollContent: { paddingHorizontal: width * 0.1, paddingBottom: 50 },
    diagonalWrapper: { position: 'absolute', top: 0, width: width, height: height * 0.45, zIndex: 0 },
    diagonalShape: { position: 'absolute', top: -height * 0.15, left: -width * 0.2, width: width * 1.5, height: height * 0.5, backgroundColor: '#B08D6D', transform: [{ rotate: '-12deg' }] },
    headerTextContainer: { position: 'absolute', top: height * 0.1, width: width, alignItems: 'center' },
    headerTitle: { fontSize: normalize(32), fontWeight: '900', color: '#FFF', letterSpacing: 8 },
    headerSubtitle: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 3, marginTop: 5, opacity: 0.8 },
    topSpacer: { height: height * 0.35 },
    sectionLabel: { color: '#B08D6D', fontSize: 10, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginBottom: 30 },
    inputGroup: { marginBottom: 18 },
    inputTitle: { fontSize: 9, fontWeight: '700', marginBottom: 8, letterSpacing: 2 },
    inputBlock: { padding: normalize(14), borderRadius: 8, fontSize: 16, borderLeftWidth: 3, borderLeftColor: '#B08D6D' },
    mainBtn: { backgroundColor: '#B08D6D', padding: normalize(18), borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 10 },
    mainBtnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 13 },
    backBtn: { marginTop: 20, alignItems: 'center' },
    backBtnText: { fontSize: 10, letterSpacing: 1 },
    cancelBtn: { marginTop: 30, alignItems: 'center' },
    cancelBtnText: { color: '#FF4D4D', fontWeight: '900', fontSize: 10, letterSpacing: 2 },
    accentText: { color: '#B08D6D', fontWeight: 'bold' },
    premiumSheet: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#F2E7D5', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 60 : 40, minHeight: height * 0.18, alignItems: 'center', zIndex: 9999, borderTopWidth: 2, elevation: 25 },
    handle: { width: 50, height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 25 },
    sheetStatusText: { fontSize: normalize(16), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
    sheetSubText: { fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: '700', marginTop: 8 }
});