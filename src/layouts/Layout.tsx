import Header from "./header/Header";
import Footer from "./footer/Footer";
import { Store } from "../types/state";
import PopupsManager from "../components/PopupsManager";
import Home from "../pages/Home";
import Sounds from "../components/Sounds";
import Lotti from "../components/lotti-animation/Lotti";
import { AnimationProvider } from "./AnimationProvider";

type Props = {
  state: Store,
  status: any,
}

export default function Layout(props: Props) {
  const { state, status } = props;

  return (
    <>
      <Sounds />
      <AnimationProvider state={state} status={status}>
        <Header {...props} />
        <Home {...props}>
          <Lotti {...props} />
        </Home>
        <Footer {...props} />
        {status.loaded && <PopupsManager {...props} />}
      </AnimationProvider>
    </>
  );
}
