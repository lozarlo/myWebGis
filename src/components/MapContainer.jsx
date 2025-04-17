import { useEffect, useRef, createContext, useContext } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Text } from "ol/style";
import useMapCookies from "./useMapCookies";
import Navbar from "./Navbar";
import Controls from "./Controls";

export default function MapContainer() {
  const mapRef = useRef();
  const mapObjectRef = useRef();
  const layerRef = useRef();
  const { getMapView, setMapView } = useMapCookies();

  const initialView = {
    center: [0, 0],
    zoom: 2,
  };

  //RESET FUNC VIEW
  function resetView() {
    const map = mapObjectRef.current;
    if (map) {
      const view = map.getView();
      view.setCenter(initialView.center);
      view.setZoom(initialView.zoom);
      setMapView(initialView);
    }
  }

  // SEARCH HANDLER
  async function handleSearchPlace(searchTerm) {
    const map = mapObjectRef.current;
    if (!map || !searchTerm) return;

    const response = await fetch("/countries.geojson");
    const geojsonData = await response.json();

    const features = new GeoJSON().readFeatures(geojsonData, {
      featureProjection: "EPSG:3857",
    });

    const match = features.find((f) => {
      const name = f.get("name") || f.get("NAME") || f.get("admin");
      return name?.toLowerCase() === searchTerm.toLowerCase();
    });
    console.log(match)

    
    if (match) {
      const extent = match.getGeometry().getExtent();
      map.getView().fit(extent, { duration: 800, padding: [50, 50, 50, 50] });
    } else {
      alert("Luogo non trovato nel GeoJSON.");
    }
  }

  // TOGGLE POPOLAZIONE
  async function togglePopulationLabels(show) {
    const map = mapObjectRef.current;
    if (!map) return;
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!show) return;
    const response = await fetch("/countries.geojson");
    const geojsonData = await response.json();

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        featureProjection: "EPSG:3857",
      })
    });

    //CREA LABLE, STILE, E INSERISCI
    const style = (feature) => {
      const pop = feature.get("pop_est") || "?";
      const name = feature.get("name");

      const label = [
        name,
        pop ? `Pop: ${pop.toString()}` : "?",
      ]
      .join('\n');

      return new Style({
        stroke: new Stroke({ color: "#333", width: 1 }),
        fill: new Fill({ color: "rgba(0,0,0,0.05)" }),
        text: new Text({
          text: label,
          fill: new Fill({ color: "#335bff" }),
          stroke: new Stroke({ color: "white", width: 2 }),
          font: "bold 12px sans-serif"
        })
      });
    };

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: style
    });

    map.addLayer(vectorLayer);
    layerRef.current = vectorLayer;
  }

  //CREA LA VIEW
  useEffect(() => {
    const savedView = getMapView();

    // console.log(savedView) obj[{center}, zoom]
    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: savedView.center || initialView.center,
        zoom: savedView.zoom || initialView.zoom,
      }),
    });

    /* LOGS
    console.log("Target:", map.getTarget());
    console.log("Layers:", map.getLayers().getArray());
    console.log("First Layer Source:", map.getLayers().item(0).getSource());
    console.log("Center:", map.getView().getCenter());
    console.log("Zoom:", map.getView().getZoom());
    */

    /* SMART FETCH
    fetch("/countries.geojson")
    .then((res) => res.json())
    .then((data) => {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(data, {
            featureProjection: "EPSG:3857",
          }),
        }),
      });
      map.addLayer(vectorLayer);
    });
  */

    mapObjectRef.current = map;

    //PRENDI DATI E METTI LAYER
    async function loadGeoJSON() {
      const response = await fetch("/countries.geojson");
      const geojsonData = await response.json();

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(geojsonData, {
            featureProjection: "EPSG:3857",
          }),
        }),
      });
      /* CLASSIC FETCH EXPLAIN
✅ Cosa fa GeoJSON().readFeatures(...)?
È un parser: trasforma i dati GeoJSON in oggetti ol.Feature.

OpenLayers non usa direttamente l'oggetto JSON: lo traduce in oggetti interni con geometria, attributi, metodi, eventi ecc.

🧭 Perché serve featureProjection: "EPSG:3857"?
Il GeoJSON originale è quasi sempre in EPSG:4326 (latitudine e longitudine in gradi)

Ma OpenLayers lavora in EPSG:3857 (Web Mercator, usato da Google Maps, OSM, ecc.)

Questa opzione dice: “converti le coordinate da 4326 a 3857”

🔹 new VectorSource({ features: [...] })
Crea una sorgente vettoriale, che contiene le feature appena convertite

Le feature sono ad esempio: poligoni dei paesi, punti, linee, ecc.

La VectorSource può essere aggiornata, filtrata, interrogata in seguito

🔹 new VectorLayer({ source: ... })
Crea un layer vettoriale, pronto per essere aggiunto alla mappa

Questo layer visualizzerà graficamente le feature contenute nella VectorSource

È il corrispondente del TileLayer, ma per dati vettoriali

🧩 Infine: aggiunta alla mappa
Anche se non è mostrato qui, il passo successivo sarebbe:

Questo aggiunge il layer (con i confini dei paesi) alla mappa, così da vederli sulla base OpenStreetMap.
*/

      map.addLayer(vectorLayer);
      /*  LOGS
      console.log("RESPONSE:", response)
      console.log("GEOJSON_DATA:" ,geojsonData)
      console.log("VECTOR_LAYER" ,vectorLayer)
      console.log("MAP", map.getLayers().item(1).getSource().getFeatures())
      */
    }

    loadGeoJSON();

      //CONTROLLI
    map.on("moveend", () => {
      const view = map.getView();
      setMapView({
        center: view.getCenter(),
        zoom: view.getZoom(),
      });
    });

    return () => map.setTarget(null);
  }, [getMapView, setMapView]);

  return (
    <>
      <Navbar onSearch={handleSearchPlace} onTogglePopulationLabels={togglePopulationLabels}/>
      <div ref={mapRef} className="w-full h-screen pt-16" />
      <Controls onResetView={resetView}/>
    </>
  );
}
