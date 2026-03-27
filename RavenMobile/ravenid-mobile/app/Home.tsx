import { gql, useQuery } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔍 Consulta REAL al Servidor
// 1. La Query Corregida
const GET_STATUS = gql`
  query GetUsuarioStatus($id: Int!) {
    getUsuarioStatus(id: $id) {
      id
      username
      registro_completo
      alumnos {
        nombre_completo
      }
    }
  }
`; // 👈 Revisa que no haya llaves extras aquí afuera
export default function HomeScreen() {
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;

    // 2. Usamos 'skip' para que no envíe variables nulas (Evita el error de image_942306)
    const { data, loading, error } = useQuery(GET_STATUS, {
        variables: { id: userId },
        skip: !userId, // 🛡️ Si userId es null, no hace la petición
    });

    if (loading) return <ActivityIndicator color="#C1E1C1" />;

    const usuario = data?.getUsuarioStatus;
    const nombreVisual = usuario?.alumnos?.nombre_completo || usuario?.username || 'Usuario';

    // Determinamos el estado real del botón
    const registroCompleto = usuario?.registro_completo || false;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.japaneseText}>メインメニュー</Text>
                <Text style={styles.mainTitle}>RAVEN ID</Text>
                <Text style={styles.subtitle}>
                    Bienvenido, <Text style={{ fontWeight: 'bold' }}>{nombreVisual}</Text>
                </Text>
            </View>

            <View style={styles.cardContainer}>
                {/* BOTÓN 1: FORMULARIO (Siempre Verde Matcha) */}
                <TouchableOpacity
                    style={styles.cardActive}
                    onPress={() => router.push({ pathname: '/Formulario', params: { id: id } } as any)}
                >
                    <Text style={styles.cardIcon}>📝</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>Mi Información</Text>
                        <Text style={styles.cardSubtitle}>Completa tu ficha técnica</Text>
                    </View>
                </TouchableOpacity>

                {/* BOTÓN 2: GENERAR QR (Se activa solo si registroCompleto es true) */}
                <TouchableOpacity
                    disabled={!registroCompleto}
                    style={registroCompleto ? styles.cardActive : styles.cardDisabled}
                    onPress={() => router.push({ pathname: '/qr', params: { id } } as any)}
                >
                    <Text style={styles.cardIcon}>{registroCompleto ? '🛡️' : '🔒'}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, !registroCompleto && { color: '#A0A0A0' }]}>
                            Generar Acceso QR
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            {registroCompleto ? 'Tu credencial está lista' : 'Bloqueado hasta completar registro'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEFDF5', padding: 25 },
    header: { marginTop: 60, marginBottom: 40, alignItems: 'center' },
    japaneseText: { color: '#88B04B', fontSize: 12, letterSpacing: 4, fontWeight: '600' },
    mainTitle: { color: '#4A4A4A', fontSize: 32, fontWeight: 'bold' },
    subtitle: { color: '#9E9E9E', fontSize: 16, marginTop: 5 },
    cardContainer: { gap: 20 },
    cardActive: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 22,
        borderRadius: 22,
        borderLeftWidth: 8,
        borderLeftColor: '#C1E1C1', // Matcha
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardDisabled: {
        backgroundColor: '#F2F2F2',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 22,
        borderRadius: 22,
        borderLeftWidth: 8,
        borderLeftColor: '#D1D1D1', // Gris
        opacity: 0.7
    },
    cardIcon: { fontSize: 30, marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' },
    cardSubtitle: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
    logoutBtn: { marginTop: 'auto', marginBottom: 30, alignItems: 'center' },
    logoutText: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 14 }
});