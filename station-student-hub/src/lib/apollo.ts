import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("auth_token");
  return {
    headers: {
      ...headers,
      // Aquí agregamos las comillas invertidas para interpolar la variable correctamente
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Cambié el nombre a 'client' por convención estándar de React, 
// pero apolloClient también funciona perfectamente si lo prefieres así.
export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});