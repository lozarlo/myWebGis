import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Data() {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    async function loadGeoJSON() {
      const response = await fetch("/countries.geojson");
      const geojsonData = await response.json();
      setFeatures(geojsonData.features || []);
    }

    loadGeoJSON();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-20">
        <h2 className="text-xl font-semibold mb-4">📊 Dati GeoJSON</h2>
        <p className="mb-4">Visualizza i dati principali estratti da ogni paese.</p>

        <div className="overflow-auto max-h-[700px] border rounded p-4 bg-white shadow text-sm">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Nome</th>
                <th className="border px-3 py-2 text-left">Admin</th>
                <th className="border px-3 py-2 text-left">Popolazione</th>
                <th className="border px-3 py-2 text-left">Coordinate</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => {
                const props = f.properties || {};
                const geometry = f.geometry;

                let center = "-";
                try {
                  const coords = geometry?.coordinates?.flat(2) || [];
                  if (coords.length) {
                    const lon = (coords.map(c => c[0]).reduce((a, b) => a + b, 0) / coords.length).toFixed(2);
                    const lat = (coords.map(c => c[1]).reduce((a, b) => a + b, 0) / coords.length).toFixed(2);
                    center = `${lon}, ${lat}`;
                  }
                } catch (e) {}

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{props.name || "-"}</td>
                    <td className="border px-3 py-2">{props.admin || "-"}</td>
                    <td className="border px-3 py-2">{props.pop_est?.toLocaleString() || "-"}</td>
                    <td className="border px-3 py-2">{center}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
