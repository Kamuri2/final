import { gql, useQuery } from '@apollo/client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // 👈 Generador de QR

// 🔍 Consulta para traer la info de Jesus
const GET_USER_FOR_QR = gql`
  query GetUserForQR($id: Int!) {
    getUsuarioStatus(id: $id) {
      id
      username
      alumnos {
        nombre_completo
        matricula
      }
    }
  }
`;

export default function QRScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(30); // Contador de 30 seg
    const [qrValue, setQrValue] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_USER_FOR_QR, {
        variables: { id: parseInt(id as string) },
        skip: !id,
    });

    // 🔄 Función para generar el contenido dinámico del QR
    const generateDynamicQR = () => {
        if (data?.getUsuarioStatus) {
            const payload = {
                uid: data.getUsuarioStatus.id,
                nom: data.getUsuarioStatus.alumnos?.nombre_completo,
                mat: data.getUsuarioStatus.alumnos?.matricula,
                ts: Date.now(), // 👈 Timestamp: La clave de la caducidad
            };
            // Convertimos el objeto a un String para el QR
            setQrValue(JSON.stringify(payload));
            setTimeLeft(30); // Reiniciamos el reloj
        }
    };

    // ⏱️ Lógica del Cronómetro
    useEffect(() => {
        if (!loading && data) generateDynamicQR();

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    generateDynamicQR(); // Refresca el QR automáticamente
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [data, loading]);

    if (loading) return <ActivityIndicator size="large" color="#88B04B" />;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.japaneseHeader}>通行証</Text>
                <Text style={styles.title}>Acceso RavenID</Text>

                <Text style={styles.userName}>
                    {data?.getUsuarioStatus?.alumnos?.nombre_completo || "Usuario"}
                </Text>

                <View style={styles.qrContainer}>
                    {qrValue ? (
                        <QRCode
                            value={qrValue}
                            size={200}
                            color="#4A4A4A"
                            backgroundColor="white"
                        />
                    ) : null}
                </View>

                <View style={styles.timerBox}>
                    <Text style={styles.timerText}>El código expira en: </Text>
                    <Text style={[styles.seconds, timeLeft < 10 && { color: '#E57373' }]}>
                        {timeLeft}s
                    </Text>
                </View>

                <Text style={styles.footerNote}>
                    Presenta este código en el lector de la entrada.
                </Text>
            </View>

            <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
                <Text style={styles.btnText}>VOLVER</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEFDF5', alignItems: 'center', justifyContent: 'center', padding: 20 },
    card: {
        backgroundColor: '#FFF', padding: 30, borderRadius: 30, alignItems: 'center', width: '100%',
        elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20
    },
    japaneseHeader: { color: '#88B04B', fontSize: 14, letterSpacing: 5, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#4A4A4A', marginBottom: 10 },
    userName: { fontSize: 16, color: '#9E9E9E', marginBottom: 20, textAlign: 'center' },
    qrContainer: { padding: 15, borderWidth: 1, borderColor: '#EEE', borderRadius: 20, backgroundColor: '#FFF' },
    timerBox: { flexDirection: 'row', marginTop: 25, alignItems: 'center' },
    timerText: { color: '#9E9E9E', fontSize: 14 },
    seconds: { color: '#88B04B', fontWeight: 'bold', fontSize: 18 },
    footerNote: { marginTop: 20, color: '#BDBDBD', fontSize: 12, textAlign: 'center' },
    btnBack: { marginTop: 30 },
    btnText: { color: '#88B04B', fontWeight: 'bold', letterSpacing: 1 }
});