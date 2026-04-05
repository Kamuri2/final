import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View,
  Dimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard, Animated, StatusBar, Image // 👈 Importamos Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

const LOGIN = gql`mutation Login($username: String!, $password: String!) { login(username: $username, password: $password) { id } }`;

export default function LoginScreen() {
  const { theme, isDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const isMounted = useRef(true);
  const fadeEntrance = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    isMounted.current = true;
    Animated.timing(fadeEntrance, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    return () => { isMounted.current = false; };
  }, []);

  const [login, { loading }] = useMutation(LOGIN);

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

  const ejecutarLogin = async () => {
    if (!username.trim() || !password) return showStatus('INGRESA TUS DATOS', 'error');
    try {
      const { data } = await login({ variables: { username: username.trim(), password } });
      if (data?.login?.id && isMounted.current) {
        Keyboard.dismiss();
        showStatus('ACCESO CONCEDIDO ✓', 'success');
        setTimeout(() => {
          if (isMounted.current) router.replace({ pathname: '/Home', params: { id: data.login.id.toString() } });
        }, 1200);
      }
    } catch (e: any) {
      if (isMounted.current) showStatus('DATOS INCORRECTOS', 'error');
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.diagonalWrapper} pointerEvents="none">
        <View style={styles.diagonalShape} />
        <View style={styles.headerTextContainer}>
          {/* 🚀 LOGO AGREGADO */}
          <Image
            source={require('../assets/images/ICONO.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>BIENVENIDO</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.formContent, { opacity: fadeEntrance }]}>
            <View style={styles.topSpacer} />

            <View style={styles.inputGroup}>
              <Text style={[styles.inputTitle, { color: theme.text }]}>USER NAME</Text>
              <TextInput
                style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]}
                placeholder="Usuario" placeholderTextColor={theme.subtext}
                value={username} onChangeText={setUsername} autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputTitle, { color: theme.text }]}>PASSWORD</Text>
              <TextInput
                style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }]}
                placeholder="••••••••" placeholderTextColor={theme.subtext}
                secureTextEntry value={password} onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: theme.subtext }]}>¿OLVIDASTE TU CLAVE? <Text style={styles.accentText}>RECUPERAR</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainBtn} onPress={ejecutarLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>LOGIN IN</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register' as any)} style={styles.footerBtn}>
              <Text style={[styles.footerText, { color: theme.subtext }]}>¿NUEVO INGRESO? <Text style={styles.accentText}>REGÍSTRATE AQUÍ</Text></Text>
            </TouchableOpacity>
          </Animated.View>
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
  formContent: { flex: 1, paddingHorizontal: width * 0.1 },
  diagonalWrapper: { position: 'absolute', top: 0, width: width, height: height * 0.45, zIndex: 0 },
  diagonalShape: { position: 'absolute', top: -height * 0.15, left: -width * 0.2, width: width * 1.5, height: height * 0.5, backgroundColor: '#B08D6D', transform: [{ rotate: '-12deg' }] },
  headerTextContainer: { position: 'absolute', top: height * 0.05, width: width, alignItems: 'center' }, // 👈 Ajustado el 'top' para que quepa el logo
  logoImage: { width: normalize(160), height: normalize(160), marginBottom: -10 }, // 👈 Estilo del Logo
  headerTitle: { fontSize: normalize(32), fontWeight: '900', color: '#FFF', letterSpacing: 8 },
  topSpacer: { height: height * 0.38 },
  inputGroup: { marginBottom: 15 },
  inputTitle: { fontSize: 9, fontWeight: '700', marginBottom: 8, letterSpacing: 2 },
  inputBlock: { padding: normalize(15), borderRadius: 8, fontSize: 16, borderLeftWidth: 3, borderLeftColor: '#B08D6D' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 9, letterSpacing: 1 },
  mainBtn: { backgroundColor: '#B08D6D', padding: normalize(18), borderRadius: 8, alignItems: 'center', elevation: 10 },
  mainBtnText: { color: '#FFF', fontWeight: '900', letterSpacing: 2 },
  footerBtn: { marginTop: 25, alignItems: 'center' },
  footerText: { fontSize: 10, letterSpacing: 1 },
  accentText: { color: '#B08D6D', fontWeight: 'bold' },
  premiumSheet: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#F2E7D5', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 60 : 40, minHeight: height * 0.18, alignItems: 'center', zIndex: 9999, borderTopWidth: 2, elevation: 25 },
  handle: { width: 50, height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 25 },
  sheetStatusText: { fontSize: normalize(16), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  sheetSubText: { fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: '700', marginTop: 8 }
});