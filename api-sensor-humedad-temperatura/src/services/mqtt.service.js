const mqtt = require("mqtt");

const COMMAND_TOPIC = "unev/dispositivos/esp32-01/comandos";

const options = {
  username: process.env.MQTT_USER || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
  reconnectPeriod: 5000,
};

const client = mqtt.connect(
  process.env.MQTT_URL || "mqtt://mosquitto:1883",
  options
);

client.on("connect", () => console.log("MQTT conectado"));
client.on("error", (error) => console.error("ERROR MQTT:", error.message));

function publicarComando(comando) {
  if (!client.connected) {
    const error = new Error("El broker MQTT no está disponible");
    error.code = "MQTT_NOT_CONNECTED";
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    client.publish(
      COMMAND_TOPIC,
      comando,
      { qos: 1, retain: false },
      (error) => (error ? reject(error) : resolve())
    );
  });
}

module.exports = {
  publicarComando,
};
