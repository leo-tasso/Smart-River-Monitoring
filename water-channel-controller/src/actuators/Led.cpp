#include "Led.h"

#include "Arduino.h"

Led::Led(int pin) : pin(pin)
{
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
}

void Led::turnOn()
{
    digitalWrite(pin, HIGH);
    this->status = true;
}

void Led::turnOff()
{
    digitalWrite(pin, LOW);
    this->status = false;
};

bool Led::isOn()
{
    return this -> status;
}