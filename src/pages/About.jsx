import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
    <Navbar />
    <div className="p-20">
      <h2 className="text-xl font-semibold mb-4">ℹ️ Info</h2>
      <p>Questa è una demo WebGIS creata con React, OpenLayers, e Tailwind.</p>
    </div>
    </>
  );
}
