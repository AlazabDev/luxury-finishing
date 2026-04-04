import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeFacebookSdk } from "./lib/meta-sdk.ts";

initializeFacebookSdk().catch((error) => {
  console.error("Facebook SDK initialization error:", error);
});

createRoot(document.getElementById("root")!).render(<App />);
