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
