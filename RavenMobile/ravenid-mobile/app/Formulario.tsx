import { gql, useMutation, useQuery } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔍 Consulta de Carreras
const GET_CARRERAS = gql`
  query GetCarreras {
    carreras {
      id
      clave
      nombre
    }
  }
`;

// 📝 Mutación Corregida (Se eliminaron los alias inválidos)
const CREAR_ALUMNO = gql`
  mutation Actualizar($id: Int!, $input: UpdateUsuariosSistemaInput!) {
    actualizarAlumno(id: $id, input: $input) {
      id
      username
      registro_completo
      # 🛡️ Pedimos los datos del alumno vinculado para confirmar
      alumnos {
        nombre_completo
        matricula
        carrera
        semestre
      }
    }
  }
`;

export default function FormularioScreen() {
    // 🚀 Recibimos el ID
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;

    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [semestre, setSemestre] = useState('');
    const [carreraSeleccionada, setCarreraSeleccionada] = useState('');

    // Consultas y Mutaciones
    const { data: catCarreras, loading: loadingCarreras } = useQuery(GET_CARRERAS);
    const [actualizar, { loading: guardandoDatos }] = useMutation(CREAR_ALUMNO);

    const manejarGuardar = async () => {
        // 1. Validaciones básicas
        if (!userId) {
            Alert.alert("Error", "No hay ID de usuario válido.");
            return;
        }
        if (!nombre || !matricula || !carreraSeleccionada) {
            Alert.alert("Aviso", "Por favor completa todos los campos.");
            return;
        }

        try {
            await actualizar({
                variables: {
                    id: userId, // ID como argumento principal
                    input: {
                        id: userId, // 👈 ID dentro del input (requerido por tu DTO)
                        nombre_completo: nombre,
                        matricula: matricula,
                        carrera: carreraSeleccionada,
                        semestre: parseInt(semestre) || 1,
                        registro_completo: true // 🔓 ¡Esto activa el QR!
                    }
                }
            });

            Alert.alert("¡Éxito!", "Registro guardado en la Machenike.");
            // Usamos replace para volver al Home y que se refresquen los datos
            router.replace('/Home');
        } catch (e: any) {
            console.log("Error detallado:", JSON.stringify(e, null, 2));
            Alert.alert("Error", "No se pudo guardar. Revisa la consola.");
        }
    };

    const confirmarCancelacion = () => {
        Alert.alert(
            "¿Salir del registro?",
            "Si sales ahora, no se activará tu acceso QR.",
            [
                { text: "Seguir editando", style: "cancel" },
                { text: "Salir", onPress: () => router.back(), style: "destructive" }
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.japaneseHeader}>学生登録</Text>
                <Text style={styles.title}>Ficha de Alumno</Text>
                <Text style={styles.subtitle}>Vincula tu identidad real</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre..." />

                <Text style={styles.label}>Matrícula</Text>
                <TextInput style={styles.input} value={matricula} onChangeText={setMatricula} keyboardType="numeric" placeholder="Número de control..." />

                <Text style={styles.label}>Semestre Actual</Text>
                <TextInput style={styles.input} value={semestre} onChangeText={setSemestre} keyboardType="numeric" placeholder="Ej. 5" />

                <Text style={styles.label}>Selecciona tu Carrera</Text>
                {loadingCarreras ? (
                    <ActivityIndicator color="#88B04B" />
                ) : (
                    <View style={styles.pickerContainer}>
                        {catCarreras?.carreras.map((c: any) => (
                            <TouchableOpacity
                                key={c.id}
                                style={[styles.carreraOption, carreraSeleccionada === c.nombre && styles.carreraSelected]}
                                onPress={() => setCarreraSeleccionada(c.nombre)}
                            >
                                <Text style={[styles.carreraText, carreraSeleccionada === c.nombre && { color: '#FFF' }]}>
                                    {c.nombre} ({c.clave})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={manejarGuardar} disabled={guardandoDatos}>
                {guardandoDatos ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.saveButtonText}>CONFIRMAR DATOS</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={confirmarCancelacion} style={styles.backButton}>
                <Text style={styles.backButtonText}>CANCELAR</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#FEFDF5', padding: 25, paddingVertical: 60 },
    headerBox: { marginBottom: 30, alignItems: 'center' },
    japaneseHeader: { color: '#88B04B', fontSize: 12, letterSpacing: 4, fontWeight: 'bold' },
    title: { color: '#4A4A4A', fontSize: 28, fontWeight: 'bold' },
    subtitle: { color: '#9E9E9E', fontSize: 14, marginTop: 5 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#4A4A4A', fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 5 },
    input: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 15, marginBottom: 18, borderWidth: 1, borderColor: '#EEE' },
    pickerContainer: { gap: 10 },
    carreraOption: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
    carreraSelected: { backgroundColor: '#88B04B', borderColor: '#88B04B' },
    carreraText: { fontSize: 14, color: '#4A4A4A' },
    saveButton: { backgroundColor: '#C1E1C1', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, elevation: 4 },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    backButton: { marginTop: 20, alignItems: 'center' },
    backButtonText: { color: '#9E9E9E', fontWeight: '600' }
});