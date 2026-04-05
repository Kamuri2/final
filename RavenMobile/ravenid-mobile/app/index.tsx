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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

const LOGIN = gql`mutation Login($username: String!, $password: String!) { login(username: $username, password: $password) { id } }`;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const isMounted = useRef(true);
  const slideAnim = useRef(new Animated.Value(250)).current; // Aumentado para que empiece más abajo por el nuevo tamaño

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const [login, { loading }] = useMutation(LOGIN);

  const showStatus = (text: string, type: 'error' | 'success') => {
    if (!isMounted.current) return;
    setStatusMessage({ text, type });

    // Entrada elegante
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 15,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Salida automática
    setTimeout(() => {
      if (isMounted.current) {
        Animated.timing(slideAnim, {
          toValue: 250,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setStatusMessage(null));
      }
    }, 3500);
  };

  const ejecutarLogin = async () => {
    if (!username.trim() || !password) return showStatus('DATOS INCOMPLETOS', 'error');
    try {
      const { data } = await login({ variables: { username: username.trim(), password } });
      if (data?.login?.id && isMounted.current) {
        Keyboard.dismiss();
        showStatus('ACCESO CONCEDIDO', 'success');
        setTimeout(() => {
          if (isMounted.current) router.replace({ pathname: '/Home', params: { id: data.login.id.toString() } });
        }, 1500);
      }
    } catch (e: any) {
      if (isMounted.current) showStatus('ACCESO DENEGADO', 'error');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER DIAGONAL */}
      <View style={styles.diagonalWrapper} pointerEvents="none">
        <View style={styles.diagonalShape} />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>WELCOME</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.formContent}>

            <View style={styles.topSpacer} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>USER NAME</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Matrícula"
                placeholderTextColor="#444"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputTitle}>PASSWORD</Text>
              <TextInput
                style={styles.inputField}
                placeholder="••••••••"
                placeholderTextColor="#444"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.mainBtn, loading && { opacity: 0.7 }]}
              onPress={ejecutarLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>LOGIN IN</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/forgot-password' as any)}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryText}>¿OLVIDASTE TU CLAVE? <Text style={styles.accentText}>RECUPERAR</Text></Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => router.push('/register' as any)}
                style={styles.footerBtn}
              >
                <Text style={styles.footerText}>
                  ¿NUEVO INGRESO? <Text style={styles.accentText}>REGÍSTRATE AQUÍ</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* --- BOTTOM SHEET SOBRIO (+20% VERTICAL) --- */}
      {statusMessage && (
        <Animated.View
          style={[
            styles.premiumSheet,
            {
              transform: [{ translateY: slideAnim }],
              borderTopColor: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D'
            }
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetContent}>
            <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>
              {statusMessage.text}
            </Text>
            <Text style={styles.sheetSubText}>Sistema RavenID • UTVT</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#121212' },
  keyboardView: { flex: 1 },

  diagonalWrapper: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.5,
    zIndex: 0,
  },
  diagonalShape: {
    position: 'absolute',
    top: -height * 0.12,
    left: -width * 0.2,
    width: width * 1.5,
    height: height * 0.55,
    backgroundColor: '#B08D6D',
    transform: [{ rotate: '-12deg' }],
  },
  welcomeContainer: {
    position: 'absolute',
    top: height * 0.15,
    width: width,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: normalize(42),
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 8,
  },

  formContent: {
    flex: 1,
    paddingHorizontal: normalize(45),
  },
  topSpacer: {
    height: height * 0.45,
  },
  inputGroup: { marginBottom: normalize(20) },
  inputTitle: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 3,
  },
  inputField: {
    backgroundColor: '#1A1A1A',
    color: '#FFF',
    padding: normalize(16),
    borderRadius: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  mainBtn: {
    backgroundColor: '#B08D6D',
    padding: normalize(18),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  mainBtnText: {
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 4,
    fontSize: 14,
  },
  secondaryAction: { marginTop: 20, alignItems: 'center' },
  secondaryText: { color: '#444', fontSize: 10, letterSpacing: 1 },
  accentText: { color: '#B08D6D', fontWeight: 'bold' },

  // --- ESTILO PREMIUM SHEET (MÁS ESPACIO VERTICAL) ---
  premiumSheet: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#F2E7D5', // 🦴 COLOR HUESO
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 15,
    // Aumento de altura vertical (20% aprox)
    paddingBottom: Platform.OS === 'ios' ? 70 : 50,
    minHeight: height * 0.18,
    alignItems: 'center',
    zIndex: 9999,
    borderTopWidth: 2,
    // Sombra profunda
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 25,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginBottom: 25,
  },
  sheetContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetStatusText: {
    fontSize: normalize(16),
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  sheetSubText: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  footer: {
    marginTop: 'auto',
    marginBottom: normalize(30),
    alignItems: 'center',
  },
  footerBtn: {
    padding: 10,
  },
  footerText: { color: '#444', fontSize: 10, letterSpacing: 1 },
});