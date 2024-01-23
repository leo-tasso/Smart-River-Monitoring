#include "ButtonImpl.h"

#include "Arduino.h"

ButtonImpl::ButtonImpl(int pin, bool pullup) : pin(pin), pullup(pullup){
    if (pullup) {
        pinMode(pin, INPUT_PULLUP);
    } else {
        pinMode(pin, INPUT);
    }
}

bool ButtonImpl::isPressed() {
    return digitalRead(pin) ^ this->pullup; //if pull up enabled, output reversed
}
