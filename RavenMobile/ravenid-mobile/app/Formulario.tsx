import { gql, useMutation, useQuery } from '@apollo/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const normalize = (size: number) => Math.round((width / 375) * size);

const GET_CARRERAS = gql`
  query GetCarreras {
    carreras {
      id
      nombre
      grupos { id nombre }
    }
  }
`;

const ACTUALIZAR = gql`
  mutation Actualizar($id: Int!, $input: UpdateUsuarioSistemaInput!) {
    actualizarAlumno(id: $id, input: $input) {
      id
      registro_completo
    }
  }
`;

export default function Formulario() {
    const { theme, isDarkMode } = useTheme();
    const { id } = useLocalSearchParams();
    const userId = id ? parseInt(id as string) : null;

    // --- CAMPOS ---
    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [semestre, setSemestre] = useState('');
    const [carreraId, setCarreraId] = useState('');
    const [grupoId, setGrupoId] = useState('');

    const { data, loading, error } = useQuery(GET_CARRERAS, { fetchPolicy: 'cache-and-network' });
    const [actualizar, { loading: guardando }] = useMutation(ACTUALIZAR);

    // 🛡️ BLINDAJE: Cálculo seguro de carrera y grupos
    const carreraActual = useMemo(() => {
        if (!data?.carreras) return null;
        return data.carreras.find((c: any) => String(c.id) === String(carreraId)) || null;
    }, [data, carreraId]);

    const grupos = carreraActual?.grupos || [];

    // 🛡️ FIX DEFINITIVO DE VISIBILIDAD: Hardcoded hex strings
    const TEXT_COLOR = isDarkMode ? '#FFFFFF' : '#1B1411';
    const PICKER_BG = isDarkMode ? '#1A1A1A' : '#F9F9F9';

    const guardar = async () => {
        // Validación de seguridad antes de enviar
        const sInt = parseInt(semestre);
        const gInt = parseInt(grupoId);

        if (!userId || !nombre.trim() || !matricula.trim() || isNaN(sInt) || isNaN(gInt)) {
            Alert.alert("Aviso", "Por favor completa todos los campos correctamente.");
            return;
        }

        try {
            const res = await actualizar({
                variables: {
                    id: userId,
                    input: {
                        id: userId,
                        nombre_completo: nombre.trim(),
                        matricula: matricula.trim(),
                        carrera: carreraActual?.nombre || '',
                        semestre: sInt,
                        grupo_id: gInt,
                        registro_completo: true
                    }
                }
            });

            if (res?.data) {
                Alert.alert("Éxito", "Registro actualizado en la Machenike.", [
                    { text: "OK", onPress: () => router.replace({ pathname: '/Home', params: { id: userId } }) }
                ]);
            }
        } catch (e: any) {
            Alert.alert("Error de Servidor", "No se pudo guardar. Revisa la conexión con tu laptop.");
        }
    };

    if (loading && !data) return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator color={theme.primary} size="large" /></View>;

    return (
        <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>DATOS DEL ALUMNO</Text>

            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.subtext }]}>NOMBRE COMPLETO</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Escribe tu nombre"
                    placeholderTextColor={theme.subtext}
                />

                <Text style={[styles.label, { color: theme.subtext }]}>MATRÍCULA</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
                    value={matricula}
                    onChangeText={setMatricula}
                    keyboardType="numeric"
                />

                <Text style={[styles.label, { color: theme.subtext }]}>SEMESTRE</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
                    value={semestre}
                    onChangeText={setSemestre}
                    keyboardType="numeric"
                />

                <Text style={[styles.label, { color: theme.subtext }]}>CARRERA ACADÉMICA</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: PICKER_BG, borderColor: theme.border }]}>
                    <Picker
                        key={`picker-carrera-${isDarkMode}`} // 👈 EL TRUCO: Fuerza el re-render para ver las letras
                        selectedValue={carreraId}
                        onValueChange={(v) => { setCarreraId(v); setGrupoId(''); }}
                        style={{ color: TEXT_COLOR }}
                        dropdownIconColor={theme.primary}
                        mode="dropdown"
                    >
                        <Picker.Item label="-- Selecciona --" value="" color={theme.subtext} />
                        {data?.carreras?.map((c: any) => (
                            <Picker.Item key={c.id} label={c.nombre} value={String(c.id)} color={TEXT_COLOR} />
                        ))}
                    </Picker>
                </View>

                {carreraId !== '' && (
                    <>
                        <Text style={[styles.label, { color: theme.subtext }]}>GRUPO</Text>
                        <View style={[styles.pickerWrapper, { backgroundColor: PICKER_BG, borderColor: theme.border }]}>
                            <Picker
                                key={`picker-grupo-${isDarkMode}`} // 👈 Fuerza el refresco del color
                                selectedValue={grupoId}
                                onValueChange={setGrupoId}
                                style={{ color: TEXT_COLOR }}
                                dropdownIconColor={theme.primary}
                                mode="dropdown"
                            >
                                <Picker.Item label="-- Selecciona --" value="" color={theme.subtext} />
                                {grupos.map((g: any) => (
                                    <Picker.Item key={g.id} label={g.nombre} value={String(g.id)} color={TEXT_COLOR} />
                                ))}
                            </Picker>
                        </View>
                    </>
                )}
            </View>

            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={guardar} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>FINALIZAR REGISTRO</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: normalize(25), paddingTop: normalize(50), flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: normalize(22), fontWeight: '900', textAlign: 'center', marginBottom: 25 },
    card: { padding: 20, borderRadius: 25, borderWidth: 1, elevation: 5 },
    label: { fontSize: 10, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    input: { padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 16 },
    pickerWrapper: { borderRadius: 12, borderWidth: 1, marginTop: 5, overflow: 'hidden' },
    btn: { padding: 18, borderRadius: 15, marginTop: 35, alignItems: 'center', elevation: 5 },
    btnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 }
});