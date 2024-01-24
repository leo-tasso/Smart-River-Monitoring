#include "PotentiometerImpl.h"

#include "Arduino.h"

PotentiometerImpl::PotentiometerImpl(int pin, int tollerance) : pin(pin), tollerance(tollerance), oldValue(analogRead(pin)) {
    //pinMode(pin, INPUT);
}

unsigned int PotentiometerImpl::position() {
    int val = map(analogRead(pin), 20, 1000, 0, 100);
    if(val<0) val = 0;
    if(val>100) val = 100;
    return val;

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
