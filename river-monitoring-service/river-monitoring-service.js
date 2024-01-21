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
const SERIAL_PORT = 'COM1'; // Change this based on your Arduino serial port
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


const port = new SerialPort({ path: SERIAL_PORT, baudRate: 9600 });
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


function setFromJson(data){
  const msg = JSON.parse(data);
  if(msg.mode==="A"){
    currentMode = MODES.AUTO;
  }
  else if (msg.mode==="M"){
    currentMode = MODES.MANUAL;
    setValve(msg.position);
  }
  console.log("Mode change "+currentMode);
}

// Serial data event handler
parser.on('data', (data) => {
  setFromJson(data);
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
    console.log(checkState().name);
    if (newState !== currentState) {
      currentState = newState;
      console.log("New mode " + newState.name);
      setFrequency(newState.frequency);
      setValve(newState.valvePosition);
    }
  }
}

function setValve(value) {
  currentPosition = value;
  const msg = { "mode": currentMode === MODES.AUTO ? 'A' : 'M', "position": value };
  const data = JSON.stringify(msg);
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
  const dataToSend = { "mode": currentMode, "position": currentPosition, "state": currentState };

  // Send the JSON response
  res.json(dataToSend);
});

app.post('/update-dashboard', (req, res) => {
  const dataFromReact = req.body;
  setFromJson(dataFromReact);
  
  // Respond with a success message
  res.json({ message: 'Data received successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

