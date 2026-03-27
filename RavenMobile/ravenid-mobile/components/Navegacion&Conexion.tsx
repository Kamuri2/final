import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';

// 🚀 CAMBIA ESTA IP por la IPv4 de tu Machenike (ej. 192.168.1.xx)
// Asegúrate de que el puerto coincida con tu NestJS (8081 o el que uses)
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://192.168.100.7:8081/graphql' }),
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" /> {/* 👈 Agregamos la ruta de registro */}
        <Stack.Screen name="qr" />
      </Stack>
    </ApolloProvider>
  );
}