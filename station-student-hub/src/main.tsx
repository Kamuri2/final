import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";


import { ApolloProvider } from "@apollo/client/react";
import { client } from "./lib/apollo";

createRoot(document.getElementById("root")!).render(

  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);  