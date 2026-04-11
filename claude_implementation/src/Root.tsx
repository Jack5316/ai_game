import { useState } from "react";
import EnchantingIntro from "./EnchantingIntro";
import App from "./mind_alchemy_v2";

export default function Root() {
  const [showIntro, setShowIntro] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem("ma_intro_skip") !== "1"
  );

  if (showIntro) {
    return <EnchantingIntro onDone={() => setShowIntro(false)} />;
  }
  return <App />;
}
