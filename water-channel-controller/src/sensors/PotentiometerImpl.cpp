#include "PotentiometerImpl.h"

#include "Arduino.h"

PotentiometerImpl::PotentiometerImpl(int pin, int tollerance) : pin(pin), tollerance(tollerance), oldValue(analogRead(pin)) {
    //pinMode(pin, INPUT);
}

unsigned int PotentiometerImpl::position() {
    return (unsigned int)map(analogRead(pin), 0, 1024, 0, 100);
}

bool PotentiometerImpl::moved() {
    unsigned int val = analogRead(pin);
    if (oldValue - tollerance < val && oldValue + tollerance > val) {
        oldValue = val;
        return false;

    } else {
        oldValue = val;
        return true;
    }
}
