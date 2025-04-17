import MapContainer from "../components/MapContainer";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="relative w-full h-full">
      <MapContainer />
    </div>
    </>
  );
}
