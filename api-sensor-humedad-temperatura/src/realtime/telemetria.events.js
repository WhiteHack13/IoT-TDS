const { EventEmitter } = require("events");

const telemetriaEvents = new EventEmitter();
telemetriaEvents.setMaxListeners(100);

module.exports = telemetriaEvents;
