// src/context/AppContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Definimos qué datos va a tener nuestro contexto
type AppContextType = {
    lang: 'es' | 'en';
    changeLanguage: (newLang: 'es' | 'en') => void;
};

// 2. Creamos el contexto (inicia vacío)
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Creamos el Provider (el componente que envolverá tu app)
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<'es' | 'en'>('es'); // Español por defecto

    // Al arrancar la app, revisamos si el usuario ya había elegido un idioma antes
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('app_language');
                if (savedLang === 'en' || savedLang === 'es') {
                    setLang(savedLang);
                }
            } catch (error) {
                console.error("Error al cargar el idioma:", error);
            }
        };
        loadLanguage();
    }, []);

    // Función para cambiar el idioma y guardarlo en la memoria del teléfono
    const changeLanguage = async (newLang: 'es' | 'en') => {
        setLang(newLang);
        await AsyncStorage.setItem('app_language', newLang);
    };

    return (
        <AppContext.Provider value={{ lang, changeLanguage }}>
            {children}
        </AppContext.Provider>
    );
}

// 4. Creamos un Hook personalizado para usar el contexto fácilmente
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext debe usarse dentro de un AppProvider');
    }
    return context;
};