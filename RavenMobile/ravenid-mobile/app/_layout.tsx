import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';

// Configuración de Apollo Client
const client = new ApolloClient({
  uri: 'https://api-fraktalid.utvt.cloud/graphql', // IP DEL SERVIDOR
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            // Transición suave de derecha a izquierda
            animation: 'slide_from_right',
            animationDuration: 350, // Velocidad balanceada
            contentStyle: { backgroundColor: 'transparent' },

          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="Login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="Unlock" />
          <Stack.Screen name="Home" />
          <Stack.Screen name="Formulario" />
        </Stack>
      </ThemeProvider>
    </ApolloProvider>
  );
}