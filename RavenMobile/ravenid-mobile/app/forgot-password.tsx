import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
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
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);

    // 🛡️ GUARDIA DE MONTAJE: Para evitar fugas de memoria y crashes al desmontar
    const isMounted = useRef(true);
    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    const [solicitarPin, { loading: loadingPin }] = useMutation(SOLICITAR_PIN);
    const [resetearPass, { loading: loadingReset }] = useMutation(RESETEAR_PASS);

    const handleSolicitar = async () => {
        if (!email.trim().includes('@')) return Alert.alert('Aviso', 'Ingresa un correo válido.');
        try {
            await solicitarPin({ variables: { email: email.trim().toLowerCase() } });
            if (isMounted.current) {
                Alert.alert('PIN Enviado', 'Revisa tu bandeja de entrada.');
                setStep(2);
            }
        } catch (e: any) {
            if (isMounted.current) Alert.alert('Aviso', 'Correo no registrado.');
        }
    };

    const handleReset = async () => {
        if (pin.length < 6 || newPassword.length < 4) return Alert.alert('Aviso', 'Datos incompletos.');

        try {
            const { data } = await resetearPass({
                variables: {
                    email: email.trim().toLowerCase(),
                    pin: pin.trim(),
                    nuevaPassword: newPassword
                }
            });

            if (data && isMounted.current) {
                // 🛡️ NAVEGACIÓN SEGURA: Usamos un timeout mínimo para que el Alert no bloquee el hilo de UI
                Alert.alert(
                    '¡Éxito!',
                    'Contraseña actualizada correctamente.',
                    [{
                        text: 'Aceptar',
                        onPress: () => {
                            // Usamos replace con un objeto para forzar el reinicio del stack al login
                            setTimeout(() => {
                                router.replace('/' as any);
                            }, 100);
                        }
                    }],
                    { cancelable: false }
                );
            }
        } catch (e: any) {
            if (isMounted.current) {
                Alert.alert('Error', 'El PIN es incorrecto o ya caducó.');
            }
        }
    };

    // 🛡️ FUNCIÓN VOLVER SEGURA
    const goBackSafe = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/' as any);
        }
    };

    return (
        <ScrollView
            style={{ backgroundColor: theme.bg }}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <Text style={[styles.japanese, { color: theme.primary }]}>パスワード再設定</Text>
                <Text style={[styles.title, { color: theme.text }]}>RECUPERAR</Text>
                <Text style={[styles.subtitle, { color: theme.primary }]}>PASO {step} DE 2</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                {step === 1 ? (
                    <View>
                        <Text style={[styles.label, { color: theme.subtext }]}>CORREO VINCULADO</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="ejemplo@utvt.edu.mx"
                            placeholderTextColor={theme.subtext + '80'}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                            onPress={handleSolicitar}
                            disabled={loadingPin}
                        >
                            {loadingPin ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>ONTENER CODIGO</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.label, { color: theme.subtext }]}>CÓDIGO PIN (6 DÍGITOS)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="000000"
                            placeholderTextColor={theme.subtext + '80'}
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <Text style={[styles.label, { color: theme.subtext }]}>NUEVA CONTRASEÑA</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="••••••••"
                            placeholderTextColor={theme.subtext + '80'}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                            onPress={handleReset}
                            disabled={loadingReset}
                        >
                            {loadingReset ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>RESTABLECER AHORA</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStep(1)} style={styles.textLink}>
                            <Text style={{ color: theme.subtext, fontSize: 12 }}>¿No te llegó? Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity onPress={goBackSafe} style={styles.textLink}>
                    <Text style={{ color: theme.subtext, fontWeight: 'bold' }}>CANCELAR</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: normalize(30), flexGrow: 1, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 30 },
    japanese: { fontSize: 10, letterSpacing: 5, fontWeight: 'bold' },
    title: { fontSize: normalize(32), fontWeight: '900', letterSpacing: 2 },
    subtitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 3, marginTop: 5 },
    card: {
        padding: 30,
        borderRadius: 30,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    label: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
    input: { borderBottomWidth: 1, padding: 10, marginBottom: 20, fontSize: 16 },
    btn: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 10 },
    btnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
    textLink: { marginTop: 15, alignItems: 'center' }
});