const config = require('./secret');


const mqtt = require('mqtt');
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')


// Constants for water level states
const STATES = {
  NORMAL: { name: 'NORMAL', frequency: 'f1', valvePosition: 25 },
  ALARM_TOO_LOW: { name: 'ALARM_TOO_LOW', frequency: 'f1', valvePosition: 0 },
  PRE_ALARM_TOO_HIGH: { name: 'PRE_ALARM_TOO_HIGH', frequency: 'f2', valvePosition: 25 },
  ALARM_TOO_HIGH: { name: 'ALARM_TOO_HIGH', frequency: 'f2', valvePosition: 50 },
  ALARM_TOO_HIGH_CRITIC: { name: 'ALARM_TOO_HIGH_CRITIC', frequency: 'f2', valvePosition: 100 }
};

// Constants for water level states
const MODES = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
};

// Constants for communication
const SERIAL_PORT = 'COM3'; // Change this based on your Arduino serial port
const MQTT_BROKER = 'mqtt://192.168.1.26'; // Change this to your MQTT broker IP

// Water level thresholds
const WL1 = 20;
const WL2 = 40;
const WL3 = 60;
const WL4 = 80;
const SENSOR_HIGHT = 95

// MQTT topics
const WATER_LEVEL_TOPIC = 'sensor/level_sensor/distance';
const LEVEL_FREQUENCY_TOPIC = 'sensor/level_sensor/frequency';


// Serial communication with Arduino


const port = new SerialPort({ path: SERIAL_PORT, baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));




// MQTT setup
const client = mqtt.connect(MQTT_BROKER);

// Initial state
let currentState = STATES.NORMAL;
let currentMode = MODES.AUTO;
let currentLevel = WL1;
let currentPosition = 0;


// Function to publish valve level to MQTT
function setFrequency(frequency) {
  client.publish(LEVEL_FREQUENCY_TOPIC, frequency.toString());
}

function setFromJson(data) {
  const msg = data;
  if (msg.mode === "A") {
    currentMode = MODES.AUTO;
  }
  else if (msg.mode === "M") {
    currentMode = MODES.MANUAL;
  }
  setValve(msg.position);
  console.log("Mode change " + currentMode);
}
function updateFromJson(data) {
  try {
    const msg = JSON.parse(data);

    if (msg.mode === "A") {
      currentMode = MODES.AUTO;
    }
    else if (msg.mode === "M") {
      currentMode = MODES.MANUAL;
    }
    console.log(msg.mode);
    currentPosition = msg.position;
  } catch (error) {
    console.error('Error parsing JSON:', error.message);
  }
}

// Serial data event handler
parser.on('data', (data) => {
  console.log("from serial: " + data);
  updateFromJson(data);
});

// MQTT connection event handler
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  // Subscribe to water level topic
  client.subscribe(WATER_LEVEL_TOPIC);
});

// MQTT message event handler
client.on('message', (topic, message) => {
  if (topic === WATER_LEVEL_TOPIC) {
    currentLevel = SENSOR_HIGHT - parseFloat(message) * 200;
    console.log(currentLevel);
    handleWaterLevelChange();
  }
});

// Handle Ctrl+C to close gracefully
process.on('SIGINT', () => {
  console.log('\nClosing the River Monitoring Service');
  port.close();
  client.end();
  process.exit();
});

function checkState() {
  if (currentLevel < WL1) return STATES.ALARM_TOO_LOW;
  if (currentLevel < WL2) return STATES.NORMAL;
  if (currentLevel < WL3) return STATES.PRE_ALARM_TOO_HIGH;
  if (currentLevel < WL4) return STATES.ALARM_TOO_HIGH;
  else return STATES.ALARM_TOO_HIGH_CRITIC;

}

function handleWaterLevelChange() {
  if (currentMode === MODES.AUTO) {
    let newState = checkState();
    if (newState !== currentState) {
      currentState = newState;
      setFrequency(newState.frequency);
    }
    if (newState.valvePosition === 0 && localTemp < 0) {
      setValve(newState.valvePosition + 10); //to avoid stopping water
    } else setValve(newState.valvePosition);
    if (currentState === STATES.ALARM_TOO_HIGH || currentState === STATES.ALARM_TOO_HIGH_CRITIC) {
      client.publish("homeassistant/light/volumeK/set", '{"state":"ON","effect":"Breath","color":{"r":255,"g":0,"b":0,"w":0}}');
      client.publish("homeassistant/number/Nixieclock", localTemp + currentLevel.toString());
      setRollerShadePosition(80);

      updateTemps();
    }
    else {
      client.publish("homeassistant/light/volumeK/set", '{"state":"OFF"}');
      client.publish("homeassistant/number/Nixieclock", "99999");
      setRollerShadePosition(100);

    }
  }
}

function setValve(value) {
  currentPosition = value;
  const msg = { "mode": currentMode === MODES.AUTO ? 'A' : 'M', "position": value };
  const data = JSON.stringify(msg) + "!";
  port.write(data, (err) => {
    if (err) {
      console.error('Error writing to Arduino:', err.message);
    } else {
      console.log(`Data written to Arduino: ${data}`);
    }
  });
}



const express = require('express');
const app = express();
const PORT = 3001;

// Use the built-in express.json() middleware to parse JSON
app.use(express.json());

// Define a route to handle a GET request
app.get('/', (req, res) => {
  const dataToSend = { "mode": currentMode, "position": currentPosition, "state": currentState.name, "level": currentLevel };
  // Send the JSON response
  res.json(dataToSend);
});

app.post('/', (req, res) => {
  const dataFromReact = req.body;
  setFromJson(dataFromReact);

  // Respond with a success message
  res.json({ message: 'Data received successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setTimeout(() => {
  setValve(0)
}, 3000);

const accessToken = config.accessToken;
let tempString = "init";
let localTemp = "init";
let externalTemp = "init";
const internalEntityId = 'sensor.ewelink_th01_temperature';
const externalEntityId = 'weather.trento';
const apiUrl = 'https://casaforli.webredirect.org:8123/api/states/';
function getEntityState(accessToken, entityId) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  return fetch(apiUrl + entityId, { headers })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching entity state:', error);
      throw error; // Propagate the error to the caller
    });
}

function updateTemps() {
  getEntityState(accessToken, internalEntityId)
    .then(data => data.state)
    .then(state => {
      localTemp = Math.round(state);
      //console.log(`The state of ${entityId} is: ${state}`);
    })
    .catch(error => {
      // Handle errors
      console.error('Error:', error);
      localTemp = ""
    });
  getEntityState(accessToken, externalEntityId)
    .then(dataExt => {
      externalTemp = dataExt.state + " " + dataExt.attributes.temperature;
      //console.log(`The state of ${entityId} is: ${state}`);
    })
    .catch(error => {
      // Handle errors
      console.error('Error:', error);
      externalTemp = ""
    });
}


function setRollerShadePosition(position) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({ entity_id: "cover.tz3000_1dd0d5yi_ts130f_cover", position: position });

  return fetch('https://casaforli.webredirect.org:8123/api/services/cover/set_cover_position', { method: 'POST', headers, body })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error setting roller shade position:', error);
      throw error; // Propagate the error to the caller
    });
}
