import Cookies from "js-cookie";

export default function useMapCookies() {
  const getMapView = () => {
    const data = Cookies.get("mapView");
    return data ? JSON.parse(data) : {};
  };

  const setMapView = (view) => {
    Cookies.set("mapView", JSON.stringify(view), { expires: 7 });
  };

  return { getMapView, setMapView };
}
