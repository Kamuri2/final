import { gql, useMutation } from '@apollo/client';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView, Platform,
  StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
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
    Animated.timing(fadeEntrance, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    return () => { isMounted.current = false; };
  }, []);

  const [login, { loading }] = useMutation(LOGIN);

  const showStatus = (text: string, type: 'error' | 'success') => {
    if (!isMounted.current) return;
    setStatusMessage({ text, type });
    Animated.spring(sheetAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }).start();
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
        showStatus('ACCESO CONCEDIDO', 'success');
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

      {/* DECORACIÓN SUPERIOR */}
      <View style={styles.diagonalWrapper} pointerEvents="none">
        <View style={[styles.diagonalShape, { backgroundColor: isDarkMode ? '#1A1A1A' : '#B08D6D' }]} />
        <View style={styles.headerTextContainer}>

          {/* RENDERIZADO DEL LOGO SEGÚN EL MODO (OSCURO/CLARO) */}
          <Image
            source={isDarkMode ? require('../assets/images/ICONO-WHRITE.png') : require('../assets/images/ICONO.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={[styles.headerTitle, { color: isDarkMode ? '#B08D6D' : '#FFF' }]}></Text>
          <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFF' : '#F2E7D5' }]}></Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.formContent, { opacity: fadeEntrance }]}>
            <View style={styles.topSpacer} />

            {/* INPUT USERNAME */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputTitle, { color: theme.subtext }]}>USUARIO</Text>
              <TextInput
                style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                placeholder="Ingresa tu usuario"
                placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                value={username} onChangeText={setUsername} autoCapitalize="none"
              />
            </View>

            {/* INPUT PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputTitle, { color: theme.subtext }]}>CONTRASEÑA</Text>
              <TextInput
                style={[styles.inputBlock, { backgroundColor: theme.cardBg, color: theme.text, borderColor: isDarkMode ? '#B08D6D33' : theme.border }]}
                placeholder="••••••••"
                placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.2)' : theme.subtext}
                secureTextEntry value={password} onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: theme.subtext }]}>¿OLVIDO SU CONTRASEÑA?  <Text style={styles.accentText}>RECUPERAR</Text></Text>
            </TouchableOpacity>

            {/* BOTÓN PRINCIPAL */}
            <TouchableOpacity style={styles.mainBtn} onPress={ejecutarLogin} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.mainBtnText}>ENTRAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register' as any)} style={styles.footerBtn}>
              <Text style={[styles.footerText, { color: theme.subtext }]}>¿NO TIENES UNA CUENTA?  <Text style={styles.accentText}>REGISTRATE</Text></Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* STATUS (DINÁMICO SEGÚN TEMA) */}
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
          <Text style={[styles.sheetStatusText, { color: statusMessage.type === 'success' ? '#B08D6D' : '#FF4D4D' }]}>{statusMessage.text}</Text>
          <Text style={[styles.sheetSubText, { color: theme.subtext }]}></Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  formContent: { flex: 1, paddingHorizontal: width * 0.1 },
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
  logoImage: { width: normalize(340), height: normalize(310), marginBottom: normalize(-15) },
  headerTitle: { fontSize: normalize(32), fontWeight: '900', letterSpacing: 6, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  headerSubtitle: { fontSize: normalize(8), fontWeight: '700', letterSpacing: 4, opacity: 0.8 },
  topSpacer: { height: height * 0.38 },
  inputGroup: { marginBottom: 40 },
  inputTitle: { fontSize: 9, fontWeight: '800', marginBottom: 2, letterSpacing: 2 },
  inputBlock: {
    padding: normalize(15),
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#B08D6D'
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 35 },
  forgotText: { fontSize: 9, letterSpacing: 1 },
  mainBtn: {
    backgroundColor: '#B08D6D',
    padding: normalize(18),
    borderRadius: 15,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#B08D6D',
    shadowOpacity: 0.4,
    shadowRadius: 10
  },
  mainBtnText: { color: '#000', fontWeight: '900', letterSpacing: 3, fontSize: 13 },
  footerBtn: { marginTop: 60, alignItems: 'center' },
  footerText: { fontSize: 10, letterSpacing: 1 },
  accentText: { color: '#B08D6D', fontWeight: 'bold' },
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
  sheetStatusText: { fontSize: normalize(16), fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  sheetSubText: { fontSize: 8, fontWeight: '700', marginTop: 8, letterSpacing: 2 }
});