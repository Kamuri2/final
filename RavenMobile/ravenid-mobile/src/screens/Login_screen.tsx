import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../schemas/Login';
import { StyledView, StyledTextInput } from '../../components/StyledComponents'; // Asumimos que los creamos
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
// 🚀 Mutación de GraphQL (debes crearla en el backend para usuarios_sistema)
const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginUserInput!) {
    login(loginInput: $loginInput) {
      access_token
      user {
        username
        rol_id # Asegúrate de que este rol sea 'estudiante'
      }
    }
  }
`;

interface LoginResponse {
    login: {
        access_token: string;
        user: {
            username: string;
            rol_id: string;
        };
    };
}

export const LoginScreen = () => {
    // Configuración del formulario con Zod
    const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { matricula: '', password: '' }
    });

    // Integración con el backend
    const [login, { loading }] = useMutation<LoginResponse>(LOGIN_MUTATION);

    const onLoginSubmit = async (data: LoginInput) => {
        try {
            // 1. Enviamos los datos al backend de tu Machenike
            const { data: responseData } = await login({
                variables: {
                    loginInput: { username: data.matricula, password: data.password }
                }
            });

            // 2. Si es exitoso, guardamos el TOKEN (ej. en SecureStore) y navegamos
            const token = responseData?.login.access_token;
            // TODO: Guardar token de forma segura
            console.log('Login Exitoso, Token recibido.');

        } catch (error) {
            console.error('Error en el login, verifica tus credenciales.');
        }
    };

    return (
        <StyledView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            {/* 🚨 PRUEBA DE VOLTAJE: Si ves esto, la pantalla funciona */}
            <Text style={{ color: '#22D3EE', fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 50 }}>
                RAVEN ID
            </Text>

            {/* TODO: Agregar logo del cuervo y texto 'RAVEN ID STUDENT' */}

            {/* Input de Matrícula */}
            <Controller
                control={control}
                name="matricula"
                render={({ field: { onChange, onBlur, value } }) => (
                    <StyledTextInput
                        placeholder="Matrícula / ユーザーID"
                        placeholderTextColor="#94A3B8"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="characters"
                        error={!!errors.matricula}
                    />
                )}
            />
            {errors.matricula && <Text style={{ color: '#F87171', marginBottom: 10 }}>{errors.matricula.message}</Text>}

            {/* Input de Contraseña */}
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <StyledTextInput
                        placeholder="Contraseña / パスワード"
                        placeholderTextColor="#94A3B8"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry // Oculta el texto
                        error={!!errors.password}
                    />
                )}
            />
            {errors.password && <Text style={{ color: '#F87171', marginBottom: 10 }}>{errors.password.message}</Text>}

            {/* Botón de Entrar */}
            <TouchableOpacity
                onPress={handleSubmit(onLoginSubmit)}
                style={{
                    backgroundColor: '#22D3EE', padding: 15, borderRadius: 12,
                    alignItems: 'center', marginTop: 20
                }}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#0F172A" />
                ) : (
                    <Text style={{ color: '#0F172A', fontWeight: 'bold', fontSize: 16 }}>
                        ENTRAR / ログイン
                    </Text>
                )}
            </TouchableOpacity>
        </StyledView>

    );
};