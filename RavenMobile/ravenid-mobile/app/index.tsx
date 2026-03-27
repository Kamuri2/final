import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. Agregamos 'id' a la respuesta para que el Home sepa quién eres
const INICIAR_SESION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      rol
      id # 👈 IMPORTANTE: Si no lo pides aquí, data.login.id será undefined
    }
  }
`;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading }] = useMutation(INICIAR_SESION);

  const ejecutarLogin = async () => {
    if (!username || !password) {
      Alert.alert('¡Aviso!', 'Ingresa usuario y contraseña, por favor.');
      return;
    }

    try {
      const { data } = await login({
        variables: {
          username: username.trim(),
          password: password
        }
      });

      // 🔐 VALIDACIÓN Y CIERRE DE LLAVES CORRECTO
      if (data?.login?.id) {
        console.log("✅ Login exitoso para ID:", data.login.id);

        router.replace({
          pathname: '/Home', // 👈 Asegúrate que tu archivo sea 'home.tsx' (minúscula)
          params: { id: data.login.id.toString() }
        } as any); // El 'as any' fuera para que TS no llore
      } else {
        Alert.alert('Error', 'El servidor no devolvió un ID de usuario.');
      }

    } catch (error: any) {
      console.error("❌ Error en Login:", error.message);
      Alert.alert('Error', 'Usuario o contraseña incorrectos.');
    }
  }; // <-- Aquí se cierra ejecutarLogin correctamente

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.japaneseText}>学生アクセス</Text>
        <Text style={styles.mainTitle}>RAVEN ID</Text>
        <Text style={styles.subtitle}>Sistema de Acceso</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          style={styles.styledInput}
          placeholder="Usuario / Matrícula"
          placeholderTextColor="#9E9E9E"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.styledInput}
          placeholder="Contraseña"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={ejecutarLogin} disabled={loading} style={styles.mainButton}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.mainButtonText}>INICIAR SESIÓN</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register' as any)} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>
            ¿Sin acceso? <Text style={styles.registerLinkTextBold}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEFDF5', justifyContent: 'center', padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  japaneseText: { color: '#9E9E9E', fontSize: 12, letterSpacing: 4, marginBottom: 5 },
  mainTitle: { color: '#4A4A4A', fontSize: 36, fontWeight: 'bold', letterSpacing: 2, marginBottom: 5 },
  subtitle: { color: '#88B04B', fontSize: 16, letterSpacing: 1 },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 25,
    ...Platform.select({
      web: { shadowColor: '#E0E0E0', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
      default: { shadowColor: '#E0E0E0', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 }
    })
  },
  styledInput: { backgroundColor: '#FFFFFF', color: '#4A4A4A', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20, fontSize: 16 },
  mainButton: {
    backgroundColor: '#C1E1C1',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
    ...Platform.select({
      web: { shadowColor: '#C1E1C1', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10 },
      default: { shadowColor: '#C1E1C1', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }
    })
  },
  mainButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  registerLink: { alignItems: 'center', padding: 10 },
  registerLinkText: { color: '#9E9E9E', fontSize: 14 },
  registerLinkTextBold: { color: '#88B04B', fontWeight: 'bold' },
});