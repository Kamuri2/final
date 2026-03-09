import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. Importamos el Proveedor de Apollo y el cliente que creaste
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./lib/apollo"; // Asegúrate de que la ruta coincida con donde guardaste el archivo anterior

createRoot(document.getElementById("root")!).render(
  // 2. Envolvemos tu App para que cualquier pantalla pueda consultar la base de datos
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);  