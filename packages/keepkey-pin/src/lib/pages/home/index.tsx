import { Grid } from "@chakra-ui/react";

// import Pin from "components/pin";
import { KeepKeyPin } from "lib/components/pin/Pin";

// import CTASection from "./components/CTASection";
// import SomeImage from "./components/SomeImage";
// import SomeText from "./components/SomeText";

const Home = () => {
  return (
    <Grid gap={4}>
      <KeepKeyPin />
    </Grid>
  );
};

export default Home;
