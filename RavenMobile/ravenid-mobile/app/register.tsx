import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View,
    Dimensions, Animated, KeyboardAvoidingView, Platform,
    TouchableWithoutFeedback, Keyboard, StatusBar, ScrollView
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
    const { theme, isDarkMode } = useTheme(); // 👈 Consumimos el tema
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const isMounted = useRef(true);
    const fadeEntrance = useRef(new Animated.Value(0)).current;
    const sheetAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        isMounted.current = true;
        Animated.timing(fadeEntrance, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        return () => { isMounted.current = false; };
    }, []);

    const [registrar, { loading }] = useMutation(REGISTRAR);

    const showStatus = (text: string, type: 'error' | 'success') => {
        if (!isMounted.current) return;
        setStatusMessage({ text, type });
        Animated.spring(sheetAnim, { toValue: 0, tension: 15, friction: 8, useNativeDriver: true }).start();
        if (type === 'error') {
            setTimeout(() => {
                if (isMounted.current) Animated.timing(sheetAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => setStatusMessage(null));
            }, 3000);
        }
    };

    const ejecutarRegistro = async () => {
        if (!username.trim() || !email.trim() || password.length < 4) return showStatus('LLENA TODOS LOS CAMPOS', 'error');
        if (!email.includes('@')) return showStatus('CORREO INVÁLIDO', 'error');
        if (password !== confirm) return showStatus('LAS CLAVES NO COINCIDEN', 'error');

        try {
            const { data } = await registrar({ variables: { input: { username: username.trim(), email: email.trim().toLowerCase(), password, rol_id: 2 } } });
            if (data?.registrarAlumno?.id && isMounted.current) {
                showStatus('CUENTA CREADA ✓', 'success');
                setTimeout(() => { if (isMounted.current) router.replace('/'); }, 1500);
            }
        } catch (e: any) {
            showStatus('FALLO EN EL SERVIDOR', 'error');
        }
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.diagonalWrapper} pointerEvents="none">
                <View style={styles.diagonalShape} />
                <View style={styles.headerTextContainer}><Text style={styles.headerTitle}>REGISTRATE</Text></View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View style={{ flex: 1, opacity: fadeEntrance }}>
                            <View style={styles.topSpacer} />
                            <Text style={styles.sectionLabel}>CREAR NUEVA CUENTA</Text>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.text }]}>USER NAME</Text>
                                <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} value={username} onChangeText={setUsername} placeholder="ejemploUser" placeholderTextColor={theme.subtext} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.text }]}>CORREO INSTITUCIONAL</Text>
                                <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="ejemplo@utvt.edu.mx" placeholderTextColor={theme.subtext} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.text }]}>PASSWORD</Text>
                                <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={theme.subtext} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputTitle, { color: theme.text }]}>CONFIRM PASSWORD</Text>
                                <TextInput style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]} secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="••••••••" placeholderTextColor={theme.subtext} />
                            </View>

                            <TouchableOpacity style={styles.mainBtn} onPress={ejecutarRegistro} disabled={loading}>
                                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>CREAR CUENTA</Text>}
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {statusMessage && (
                <Animated.View style={[styles.premiumSheet, { transform: [{ translateY: sheetAnim }], borderTopColor: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
                    <View style={styles.handle} />
                    <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>{statusMessage.text}</Text>
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
    headerTextContainer: { position: 'absolute', top: height * 0.12, width: width, alignItems: 'center' },
    headerTitle: { fontSize: normalize(32), fontWeight: '900', color: '#FFF', letterSpacing: 8 },
    topSpacer: { height: height * 0.3 },
    sectionLabel: { color: '#B08D6D', fontSize: 10, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginBottom: 30 },
    inputGroup: { marginBottom: 18 },
    inputTitle: { fontSize: 9, fontWeight: '700', marginBottom: 8, letterSpacing: 2 },
    inputBlock: { padding: normalize(14), borderRadius: 8, fontSize: 16, borderLeftWidth: 3, borderLeftColor: '#B08D6D' },
    mainBtn: { backgroundColor: '#B08D6D', padding: normalize(18), borderRadius: 8, alignItems: 'center', marginTop: 20, elevation: 10 },
    mainBtnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2 },
    premiumSheet: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#F2E7D5', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 60 : 40, minHeight: height * 0.18, alignItems: 'center', zIndex: 9999, borderTopWidth: 2, elevation: 25 },
    handle: { width: 50, height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 25 },
    sheetStatusText: { fontSize: normalize(16), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
    sheetSubText: { fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: '700', marginTop: 8 }
});