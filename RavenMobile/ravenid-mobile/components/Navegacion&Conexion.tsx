import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';

// CAMBIAR ESTA IP por la DEL SERVIDOR)
// Asegúrar de que el puerto COINCIDA
const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api-fraktalid.utvt.cloud/graphql' }),
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" /> {/* ruta de registro */}
        <Stack.Screen name="qr" />
      </Stack>
    </ApolloProvider>
  );
}