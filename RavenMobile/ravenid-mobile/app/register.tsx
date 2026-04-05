import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

// 1. Mutation actualizada con el campo email
const REGISTRAR = gql`
  mutation Registrar($input: CreateUsuarioSistemaInput!) { 
    registrarAlumno(input: $input) { 
      id 
    } 
  }
`;

export default function RegisterScreen() {
    const { theme } = useTheme();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // 👈 NUEVO ESTADO
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [registrar, { loading }] = useMutation(REGISTRAR);

    const ejecutarRegistro = async () => {
        // 2. Validación de datos incluyendo email
        if (!username.trim() || !email.trim() || password.length < 4) {
            return Alert.alert('Aviso', 'Por favor, llena todos los campos.');
        }

        // Validación básica de formato de correo
        if (!email.includes('@')) {
            return Alert.alert('Error', 'Ingresa un correo electrónico válido.');
        }

        if (password !== confirm) {
            return Alert.alert('Error', 'Las contraseñas no coinciden.');
        }

        try {
            // 3. Enviar email al backend
            const { data } = await registrar({
                variables: {
                    input: {
                        username: username.trim(),
                        email: email.trim().toLowerCase(), // 👈 SE AGREGA EMAIL
                        password,
                        rol_id: 2
                    }
                }
            });

            if (data?.registrarAlumno?.id) {
                Alert.alert('¡Éxito!', 'Cuenta creada correctamente.', [{ text: 'OK', onPress: () => router.replace('/') }]);
            }
        } catch (e: any) {
            // Manejo de errores específicos
            let msg = 'Fallo en el servidor';
            if (e.message.includes('Unique constraint')) {
                msg = e.message.includes('username') ? 'Esta matrícula ya existe' : 'Este correo ya está registrado';
            }
            Alert.alert('Error', msg);
        }
    };

    return (
        <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.japanese, { color: theme.primary }]}>新規登録</Text>
                <Text style={[styles.title, { color: theme.text }]}>REGISTRO</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>

                <Text style={[styles.label, { color: theme.subtext }]}>USUARIO</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="ejemploUser"
                    placeholderTextColor={theme.subtext + '80'}
                />

                {/* 4. NUEVO CAMPO DE EMAIL */}
                <Text style={[styles.label, { color: theme.subtext }]}>CORREO INSTITUCIONAL</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="ejemplo@utvt.edu.mx"
                    placeholderTextColor={theme.subtext + '80'}
                />

                <Text style={[styles.label, { color: theme.subtext }]}>CONTRASEÑA</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={theme.subtext + '80'}
                />

                <Text style={[styles.label, { color: theme.subtext }]}>CONFIRMAR</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    secureTextEntry
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="••••••••"
                    placeholderTextColor={theme.subtext + '80'}
                />

                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={ejecutarRegistro} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CREAR CUENTA</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 15 }}>
                    <Text style={{ color: theme.subtext, textAlign: 'center', fontSize: 12 }}>Volver</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: normalize(30), flexGrow: 1, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 30 },
    japanese: { fontSize: 12, letterSpacing: 10, fontWeight: 'bold' },
    title: { fontSize: 32, fontWeight: '900' },
    card: { padding: 30, borderRadius: 25, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    label: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
    input: { borderBottomWidth: 1, padding: 10, marginBottom: 20, fontSize: 16 },
    btn: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});