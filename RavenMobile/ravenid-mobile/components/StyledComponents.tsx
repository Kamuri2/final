import React from 'react';
import { View, TextInput, TextInputProps, ViewProps } from 'react-native';

// 1. Contenedor Principal (Fondo oscuro)
export const StyledView = (props: ViewProps) => {
    return (
        <View
            {...props}
            style={[{ backgroundColor: '#0F172A' }, props.style]}
        />
    );
};

// 2. Input Estilizado (Cian Neón y Rojo para Errores)
interface StyledTextInputProps extends TextInputProps {
    error?: boolean;
}

export const StyledTextInput = ({ error, style, ...props }: StyledTextInputProps) => {
    return (
        <TextInput
            {...props}
            style={[
                {
                    backgroundColor: '#1E293B', // Un gris/azul muy oscuro
                    color: '#F8FAFC',           // Texto casi blanco
                    padding: 15,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: error ? '#F87171' : '#334155', // Rojo si hay error, gris si no
                    marginBottom: 5,
                    fontSize: 16,
                },
                style,
            ]}
        />
    );
};