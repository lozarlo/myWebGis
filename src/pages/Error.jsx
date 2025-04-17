import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Error() {
  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Oops! Pagina non trovata.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Torna alla mappa
      </Link>
    </div>
    </>
  );
}
