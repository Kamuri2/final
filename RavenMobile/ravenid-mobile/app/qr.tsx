import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
const QRCode = require('react-native-qrcode-svg').default;

export default function QrScreen() {
    // 1. Atrapamos los datos de sesión que mandó el Login
    const { idEstudiante } = useLocalSearchParams();

    // 2. Estado para el contenido del QR (Matrícula + Timestamp actual)
    const [qrData, setQrData] = useState('');

    // 3. Generar el paquete de datos al entrar a la pantalla
    useEffect(() => {
        const generarDatosQR = () => {
            const timestamp = new Date().getTime(); // El tiempo en milisegundos

            // Armamos un JSON (Esto es lo que el escáner del guardia va a leer)
            const paqueteSecreto = JSON.stringify({
                matricula: idEstudiante,
                horaGeneracion: timestamp,
                firma: 'RavenID-App'
            });

            setQrData(paqueteSecreto);
        };

        generarDatosQR();
    }, [idEstudiante]);

    const cerrarSesion = () => {
        router.replace('/Home');
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

            {/* Encabezado Japonés */}
            <Text style={{ color: '#22D3EE', fontSize: 18, letterSpacing: 3, marginBottom: 5 }}>
                学生アクセス
            </Text>
            <Text style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 'bold', marginBottom: 40, letterSpacing: 1 }}>
                TOKEN DE ACCESO
            </Text>

            {/* Contenedor del QR estilo Sci-Fi */}
            <View style={{
                padding: 20,
                backgroundColor: '#1E293B',
                borderRadius: 15,
                borderWidth: 2,
                borderColor: '#22D3EE',
                shadowColor: '#22D3EE',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                marginBottom: 30,
                alignItems: 'center'
            }}>
                {/* 🚀 Renderizado del QR */}
                {qrData ? (
                    <QRCode
                        value={qrData}
                        size={220}
                        color="#22D3EE"
                        backgroundColor="#1E293B"
                    />
                ) : (
                    <Text style={{ color: '#94A3B8' }}>Generando llave...</Text>
                )}
            </View>

            <Text style={{ color: '#94A3B8', fontSize: 16, marginBottom: 50 }}>
                Matrícula: <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{idEstudiante}</Text>
            </Text>

            {/* Botón de salida de emergencia */}
            <TouchableOpacity
                onPress={cerrarSesion}
                style={{ borderWidth: 1, borderColor: '#F87171', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 }}
            >
                <Text style={{ color: '#F87171', fontSize: 14, fontWeight: 'bold' }}>
                    CERRAR SESIÓN / ログアウト
                </Text>
            </TouchableOpacity>

        </View>
    );
}