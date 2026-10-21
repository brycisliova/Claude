// Form delivery settings. Fill in ONE of these to switch on the forms (see README, "Switch on the forms").
// Both services deliver submissions to your inbox; the keys below are safe to publish.
export const FORMS = {
  web3formsKey: "fc13053c-6375-4bfa-ab6d-634957f50490",   // from https://web3forms.com (free; enter shiningforevr@gmail.com to get a key by email)
  formspreeId: "",    // from https://formspree.io (the part after /f/ in your form endpoint)
  email: "shiningforevr@gmail.com"
};

// Together mode (playing games with friends on other devices). Rooms are relayed through a free public MQTT broker,
// so there is nothing to host. Brokers are tried in order when someone creates a room, and the last character of a
// room code records which broker it uses. To use your own broker, put its WebSocket address first.
export const MULTIPLAYER = {
  brokers: [
    "wss://broker.emqx.io:8084/mqtt",
    "wss://broker.hivemq.com:8884/mqtt",
    "wss://test.mosquitto.org:8081"
  ]
};

// Optional Google Street View for "Where in the world?". Leave googleKey empty and the game uses photographs only.
// To switch Street View on, create a Maps JavaScript API key in Google Cloud (it needs a billing account, and Google
// gives a monthly free allowance), restrict it to your site address (https://shiningforever.in/*) and paste it here.
// The key is safe to publish once it is restricted. See the README, "Switch on Street View".
export const MAPS = {
  googleKey: "",
  // Street-map tiles for the detailed map. The default is the public OpenStreetMap server, which is fine for a small
  // site but asks not to be used heavily (https://operations.osmfoundation.org/policies/tiles/). If the games get busy,
  // switch to a tile host that gives you a key, for example MapTiler or Stadia, and put its URL here.
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
};
