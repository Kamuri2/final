import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext'; // 🛡️ Asegúrate que esté fuera de la carpeta 'app'

// Configuración de Apollo Client
const client = new ApolloClient({
  uri: 'http://192.168.100.16:3000/graphql', // 👈 Tu IP de la Machenike
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            // 🛡️ CAMBIO: Transición suave de derecha a izquierda
            animation: 'slide_from_right',
            animationDuration: 350, // 🛡️ Velocidad balanceada
            contentStyle: { backgroundColor: 'transparent' }, // 🛡️ Evita destellos blancos entre cambios
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="Home" />
          <Stack.Screen name="Formulario" />
        </Stack>
      </ThemeProvider>
    </ApolloProvider>
  );
}