import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// app/register.tsx

const REGISTRAR_ALUMNO = gql`
  mutation Registrar($input: CreateUsuarioSistemaInput!) {
    registrarAlumno(input: $input) {
      id # 👈 Pedimos el ID real
      username    # 👈 Usamos username en lugar de matricula
    }
  }
`;
export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [registrar, { loading }] = useMutation(REGISTRAR_ALUMNO, {
        onCompleted: () => {
            Alert.alert('¡Éxito!', 'Alumno registrado correctamente. Ya puedes iniciar sesión.');
            router.replace('/'); // Volver al login
        },
        onError: (error) => {
            console.error(error);
            Alert.alert('Error', 'No se pudo registrar. ¿Esa matrícula ya existe?');
        }
    });

    const ejecutarRegistro = async () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert('Aviso', 'Por favor llena todos los campos.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        try {
            await registrar({
                variables: {
                    input: {
                        username: username.trim(),
                        password: password,
                        rol_id: 2 // Aunque el backend lo fuerce, lo enviamos por claridad
                    }
                }
            });
        } catch (e) {
            // Los errores se manejan en el onError del hook
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.japaneseText}>新規登録</Text>
                <Text style={styles.mainTitle}>RAVEN ID</Text>
                <Text style={styles.subtitle}>Crear Cuenta de Alumno</Text>
            </View>

            <View style={styles.formCard}>
                <Text style={styles.inputLabel}>Nombre de Usuario</Text>
                <TextInput
                    style={styles.styledInput}
                    placeholder="Ej: A01234567"
                    placeholderTextColor="#9E9E9E"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                    style={styles.styledInput}
                    placeholder="Crea una contraseña"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
                <TextInput
                    style={styles.styledInput}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity onPress={ejecutarRegistro} disabled={loading} style={styles.mainButton}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.mainButtonText}>REGISTRARSE</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backLinkText}>¿Ya tienes cuenta? <Text style={styles.backLinkTextBold}>Inicia sesión</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#FEFDF5', justifyContent: 'center', padding: 25 },
    headerContainer: { alignItems: 'center', marginBottom: 30 },
    japaneseText: { color: '#88B04B', fontSize: 14, letterSpacing: 6, marginBottom: 5, fontWeight: '600' },
    mainTitle: { color: '#4A4A4A', fontSize: 40, fontWeight: 'bold', letterSpacing: 2 },
    subtitle: { color: '#9E9E9E', fontSize: 16, marginTop: 5 },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 30,
        borderRadius: 30,
        ...Platform.select({
            web: { boxShadow: '0px 10px 25px rgba(193, 225, 193, 0.2)' },
            default: { shadowColor: '#C1E1C1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 }
        })
    },
    inputLabel: { color: '#4A4A4A', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 5 },
    styledInput: {
        backgroundColor: '#F9F9F9',
        color: '#4A4A4A',
        padding: 16,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        marginBottom: 20,
        fontSize: 16
    },
    mainButton: {
        backgroundColor: '#C1E1C1', // Verde Matcha
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        ...Platform.select({
            web: { boxShadow: '0px 8px 15px rgba(193, 225, 193, 0.4)' },
            default: { shadowColor: '#C1E1C1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }
        })
    },
    mainButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
    backLink: { alignItems: 'center' },
    backLinkText: { color: '#9E9E9E', fontSize: 14 },
    backLinkTextBold: { color: '#88B04B', fontWeight: 'bold' },
});