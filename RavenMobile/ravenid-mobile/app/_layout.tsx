import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Stack } from 'expo-router';

const client = new ApolloClient({

  uri: 'http://192.168.100.7:3000/graphql',
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      {/* 🛡️ El Stack permite navegar sin barritas estorbosas abajo */}
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="qr" />
      </Stack>
    </ApolloProvider>
  );
}