import "../src/index.css";
import { AuthProvider } from "../src/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "../src/components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Component {...pageProps} />
        </main>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}
