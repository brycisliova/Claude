// Optional Google Street View for the location game. Nothing here runs, and nothing is requested from Google, unless a
// restricted API key is set in assets/js/config.js and a player opens the Street View tab.
import { MAPS } from "../config.js";

export const hasStreetView = () => !!(MAPS && MAPS.googleKey);
let lib = null;
function loadGoogle() {
  return (lib ||= new Promise((resolve, reject) => {
    const fail = (why) => { lib = null; reject(new Error(why)); };
    window.gm_authFailure = () => fail("key");
    if (window.google?.maps?.importLibrary) return resolve();
    const cb = "__wwaMaps" + Date.now(); window[cb] = () => resolve();
    const sc = document.createElement("script");
    sc.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS.googleKey)}&v=weekly&loading=async&callback=${cb}`;
    sc.async = true; sc.onerror = () => fail("load"); document.head.appendChild(sc);
    setTimeout(() => fail("timeout"), 20000);
  }).then(() => window.google.maps.importLibrary("streetView")));
}

// Shows the Street View panorama nearest to a place in el. Resolves to { destroy() }, or null when there is none nearby.
export async function showStreet(el, loc) {
  const g = await loadGoogle();
  const svc = new g.StreetViewService();
  const res = await svc.getPanorama({ location: { lat: loc.lat, lng: loc.lon }, radius: 3000, preference: g.StreetViewPreference?.NEAREST, source: g.StreetViewSource?.OUTDOOR }).catch(() => null);
  const pano = res?.data?.location?.pano; if (!pano) return null;
  const view = new g.StreetViewPanorama(el, { pano, addressControl: false, showRoadLabels: false, fullscreenControl: false, motionTracking: false, motionTrackingControl: false, enableCloseButton: false, zoomControl: true, panControl: true, linksControl: true, clickToGo: true });
  return { destroy() { try { view.setVisible(false); } catch (e) { /* gone */ } el.innerHTML = ""; } };
}
