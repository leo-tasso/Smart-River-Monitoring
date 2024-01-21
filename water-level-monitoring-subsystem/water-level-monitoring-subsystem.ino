#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Replace these with your Wi-Fi credentials
const char *ssid = "ACANTHO";
const char *password = "Solamente3#12";

// Replace these with your MQTT broker details
const char *mqtt_server = "192.168.1.26";
const char *mqtt_username = "level_sensor";
const char *mqtt_password = "";
const char *mqtt_client_id = "level_sensor";

// Define the ultrasonic sensor pins
#define TRIGGER_PIN D0
#define ECHO_PIN D1

// Define the LED pins
#define GREEN_LED D2
#define RED_LED D3

#define F1 2000
#define F2 1000

// Define the MQTT topic for distance and frequency
const char *distance_topic = "sensor/level_sensor/distance";
const char *frequency_topic = "sensor/level_sensor/frequency";

// Variables for ultrasonic sensor and MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Variables for timing
unsigned long lastMillis = 0;
unsigned long frequency = F1;  // Default frequency in milliseconds (1 second)

const float temperature = 20;
const float vs = 331.45 + 0.62 * temperature;

void setup() {
  Serial.begin(9600);

  // Setup LEDs
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  digitalWrite(GREEN_LED, LOW);  // Green LED off
  digitalWrite(RED_LED, HIGH);   // Red LED off
  Serial.println("Booting...");
  // Setup ultrasonic sensor pins
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set up MQTT
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // Connect to MQTT
  reconnect();
}

void loop() {
  // Reconnect to MQTT if connection lost
  if (!client.connected()) {
    reconnect();
  }

  // Check for new MQTT messages
  client.loop();

  // Measure distance and send data if it's time
  if (millis() - lastMillis >= frequency) {
    float distance = getDistance();
    bool success = sendDistance(distance);
    if (success) {
      digitalWrite(GREEN_LED, HIGH);  // Green LED on
      digitalWrite(RED_LED, LOW);     // Red LED off
    } else {
      digitalWrite(GREEN_LED, LOW);  // Green LED off
      digitalWrite(RED_LED, HIGH);   // Red LED on
    }
    lastMillis = millis();
  }
}

float getDistance() {
  /* Triggering stage: sending the impulse */

  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(3);
  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(5);
  digitalWrite(TRIGGER_PIN, LOW);

  /* Receiving the echo */

  float tUS = pulseIn(ECHO_PIN, HIGH);
  float t = tUS / 1000.0 / 1000.0 / 2;
  float d = t * vs;
  return d;
}

bool sendDistance(float distance) {
  char message[10];
  snprintf(message, sizeof(message), "%.2f", distance);
  return client.publish(distance_topic, message);
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(mqtt_client_id, mqtt_username, mqtt_password)) {
      Serial.println("Connected to MQTT broker");
      // Subscribe to frequency topic
      client.publish(frequency_topic, frequency==F1?"f1":"f2");
      client.subscribe(frequency_topic);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      digitalWrite(GREEN_LED, LOW);  // Green LED off
      digitalWrite(RED_LED, HIGH);   // Red LED on
      delay(5000);
    }
  }
}

void callback(char *topic, byte *payload, unsigned int length) {
  // Handle messages arriving from MQTT
  if (strcmp(topic, frequency_topic) == 0) {
    payload[length] = '\0';
    if (strcmp((char *)payload, "f1") == 0) {
      frequency = F1;  // Set to once a second
    } else if (strcmp((char *)payload, "f2") == 0) {
      frequency = F2;  // Set to twice a second
    }
    Serial.print("Frequency set to ");
    Serial.print(frequency);
    Serial.println(" milliseconds");
  }
}
