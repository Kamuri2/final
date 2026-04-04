import { gql, useMutation, useQuery } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const GET_CARRERAS = gql`
  query GetCarreras {
    carreras {
      id
      nombre
      grupos { id nombre }
    }
  }
`;

const ACTUALIZAR_ALUMNO = gql`
  mutation Actualizar($id: Int!, $input: UpdateUsuarioSistemaInput!) {
    actualizarAlumno(id: $id, input: $input) {
      id
      registro_completo
    }
  }
`;

export default function Formulario() {
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;

    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [semestre, setSemestre] = useState('');
    const [carreraId, setCarreraId] = useState('');
    const [grupoId, setGrupoId] = useState('');

    const { data, loading, error } = useQuery(GET_CARRERAS, { fetchPolicy: 'network-only' });
    const [actualizar, { loading: guardando }] = useMutation(ACTUALIZAR_ALUMNO);

    // 🛡️ ESCUDO 1: Si no hay ID, no renderizamos nada pesado
    if (!userId) {
        return <View style={styles.center}><Text>Error: Sesión inválida. Reingresa.</Text></View>;
    }

    const carreraActual = useMemo(() => {
        if (!data?.carreras || !carreraId) return null;
        return data.carreras.find((c: any) => String(c.id) === String(carreraId)) || null;
    }, [data, carreraId]);

    const grupos = carreraActual?.grupos || [];

    const manejarGuardar = async () => {
        const semInt = parseInt(semestre);
        const grpInt = parseInt(grupoId);

        if (!nombre.trim() || !matricula.trim() || isNaN(semInt) || isNaN(grpInt)) {
            Alert.alert("Aviso", "Completa todos los campos, incluyendo el grupo.");
            return;
        }

        try {
            // 🛡️ ESCUDO 2: Optional Chaining en la respuesta para evitar el cierre (crash)
            const respuesta = await actualizar({
                variables: {
                    id: userId,
                    input: {
                        id: userId,
                        nombre_completo: nombre.trim(),
                        matricula: matricula.trim(),
                        carrera: carreraActual?.nombre || '',
                        semestre: semInt,
                        grupo_id: grpInt,
                        registro_completo: true
                    }
                },
                refetchQueries: ['GetUsuarioActual']
            });

            if (respuesta?.data?.actualizarAlumno) {
                Alert.alert("¡Éxito!", "Datos guardados.", [{ text: "OK", onPress: () => router.replace({ pathname: '/Home', params: { id: userId } }) }]);
            }
        } catch (e: any) {
            // 🛡️ ESCUDO 3: Atrapamos el error aquí para que Expo NO se cierre
            console.log("Error detectado:", e);

            // Si el error dice "property grupo_id should not exist", es el DTO de la laptop
            const esErrorDto = e.message.includes("grupo_id") || JSON.stringify(e).includes("grupo_id");

            Alert.alert(
                "El servidor rechazó los datos",
                esErrorDto
                    ? "El campo 'grupo_id' no está autorizado en NestJS. Revisa el DTO en tu laptop."
                    : "Error de servidor: " + e.message
            );
        }
    };

    if (loading && !data) return <View style={styles.center}><ActivityIndicator size="large" color="#88B04B" /></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Registro RavenID</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

                <Text style={styles.label}>Matrícula</Text>
                <TextInput style={styles.input} value={matricula} onChangeText={setMatricula} keyboardType="numeric" />

                <Text style={styles.label}>Semestre</Text>
                <TextInput style={styles.input} value={semestre} onChangeText={setSemestre} keyboardType="numeric" />

                <Text style={styles.label}>Carrera</Text>
                <View style={styles.pickerBox}>
                    <Picker selectedValue={carreraId} onValueChange={(v) => { setCarreraId(v); setGrupoId(''); }}>
                        <Picker.Item label="Selecciona Carrera" value="" />
                        {data?.carreras?.map((c: any) => <Picker.Item key={c.id} label={c.nombre} value={String(c.id)} />)}
                    </Picker>
                </View>

                {carreraId !== '' && (
                    <>
                        <Text style={styles.label}>Grupo</Text>
                        <View style={styles.pickerBox}>
                            <Picker selectedValue={grupoId} onValueChange={setGrupoId}>
                                <Picker.Item label="Selecciona Grupo" value="" />
                                {grupos.map((g: any) => <Picker.Item key={g.id} label={g.nombre} value={String(g.id)} />)}
                            </Picker>
                        </View>
                    </>
                )}
            </View>

            <TouchableOpacity style={styles.btn} onPress={manejarGuardar} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GUARDAR REGISTRO</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 25, paddingTop: 60, backgroundColor: '#FEFDF5', flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 4 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 12, fontWeight: 'bold', marginTop: 10, color: '#666' },
    input: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
    pickerBox: { backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#EEE', overflow: 'hidden', marginTop: 5 },
    btn: { backgroundColor: '#88B04B', padding: 20, borderRadius: 12, marginTop: 25, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold' }
});