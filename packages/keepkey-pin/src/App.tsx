import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { I18nProvider } from 'lib/context/I18nProvider/I18nProvider'
import Layout from "lib/layout";
import Routings from "lib/router/Routings";
import { theme } from "lib/styles/theme";

const App = () => (
  <ChakraProvider theme={theme}>
    <I18nProvider>
      <Router>
        <Layout>
          <Routings />
        </Layout>
      </Router>
    </I18nProvider>
  </ChakraProvider>
);

export default App;
