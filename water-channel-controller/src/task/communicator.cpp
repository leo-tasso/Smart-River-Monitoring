#include "communicator.h"

#include <Arduino.h>
#include <ArduinoJson.h>

#include "WaterChannelController.h"
#include "actuators/Led.h"
#include "system/logger.h"
#include "config.h"

Communicator::Communicator(int period, WaterChannelController* waterChannelController, int greenLedPin, int redLedPin)
    : Task(period),
      waterChannelController(waterChannelController),
      greenLed(new Led(greenLedPin)),
      redLed(new Led(redLedPin)) {
    Serial.begin(115200);
    redLed->turnOn();
    greenLed->turnOff();
}

void Communicator::tick() {
    if (Serial.availableForWrite() && waterChannelController->commChange) {
        DynamicJsonDocument doc(128);
        doc["mode"] = waterChannelController->activeMode == Mode::AUTO ? "A" : "M";
        doc["position"] = waterChannelController->activePosition;
        serializeJson(doc, Serial);
        Serial.println();
        Serial.flush();
        waterChannelController->commChange = false;
    }
    if (Serial.available() > 0) {
        redLed->turnOff();
        greenLed->turnOn();
        this->lastMessage = millis();
        String received = Serial.readStringUntil('!');

        // Parse received JSON

        DynamicJsonDocument doc(128);
        DeserializationError error = deserializeJson(doc, received);

        // Check for parsing errors
        if (error) {
            Serial.print(F("Error parsing JSON: "));
            Serial.println(error.c_str());
            return;
        }

        // Access the parsed values
        const char* mode = doc["mode"];
        int position = doc["position"];
        if (*mode == 'A') {
            waterChannelController->activeMode = Mode::AUTO;
        } else {
            waterChannelController->activeMode = Mode::MANUAL;
        }
        waterChannelController->activePosition = position;
        waterChannelController->commChange = true;
        waterChannelController->posChange = true;
    }
    if (millis() - this->lastMessage > TIME_OUT_CONNECTION) {
        redLed->turnOn();
        greenLed->turnOff();
    }
};