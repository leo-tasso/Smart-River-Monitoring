#include "ServoMotorImpl.h"

#include "Arduino.h"

ServoMotorImpl::ServoMotorImpl(int pin) : pin(pin) {
}

void ServoMotorImpl::on() {
    motor.attach(pin);
}

void ServoMotorImpl::off() {
    motor.detach();
}

void ServoMotorImpl::setPosition(int angle) {
    if (angle > 180) {
        angle = 180;
    } else if (angle < 0) {
        angle = 0;
    }

    double coeff = (2400.0 - 544.0) / 180;
    motor.write((int)(544 + angle * coeff));
}