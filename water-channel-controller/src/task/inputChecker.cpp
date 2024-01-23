#include "inputChecker.h"

#include <Arduino.h>

#include "WaterChannelController.h"
#include "sensors/ButtonImpl.h"
#include "sensors/PotentiometerImpl.h"
#include "system/logger.h"

InputChecker::InputChecker(int period, WaterChannelController* WaterChannelController, int buttonPin, int potPin)
    : Task(period),
      waterChannelController(WaterChannelController),
      pressed(false),
      button(new ButtonImpl(buttonPin, true)),
      potentiometer(new PotentiometerImpl(potPin, 20)) {
    waterChannelController->posChange = true;
    oldPotPos = potentiometer->position();
}

void InputChecker::tick() {
    if (potentiometer->moved()) {
        waterChannelController->activeMode = Mode::MANUAL;
        waterChannelController->activePosition = potentiometer->position();
        waterChannelController->posChange = true;
        waterChannelController->commChange = true;

    } else if (!this->pressed && button->isPressed()) {
        waterChannelController->activeMode = waterChannelController->activeMode == Mode::MANUAL ? Mode::AUTO : Mode::MANUAL;
        waterChannelController->posChange = true;
        waterChannelController->commChange = true;
    }
    this->pressed = button->isPressed();
};