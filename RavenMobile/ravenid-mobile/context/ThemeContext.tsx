import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paleta UTVT Oficial
export const lightTheme = {
    bg: '#F9F9F7', text: '#1B1411', subtext: '#6F4E37',
    primary: '#2D5A27', accent: '#8B5E3C', border: '#DEDECF', cardBg: '#FFFFFF'
};

export const darkTheme = {
    bg: '#0D0D0D', text: '#F9F9F7', subtext: '#A0A090',
    primary: '#4A7040', accent: '#6F4E37', border: '#2D2D2D', cardBg: '#1A1A1A'
};

const ThemeContext = createContext({
    isDarkMode: true,
    toggleTheme: () => { },
    theme: darkTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            const saved = await AsyncStorage.getItem('theme_pref');
            if (saved !== null) setIsDarkMode(saved === 'dark');
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        await AsyncStorage.setItem('theme_pref', newMode ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme: isDarkMode ? darkTheme : lightTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);