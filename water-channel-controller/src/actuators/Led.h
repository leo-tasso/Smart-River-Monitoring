#ifndef __LED__
#define __LED__

#include "Light.h"

class Led : public Light
{
public:
    Led(int pin);
    void turnOn() override;
    void turnOff() override;
    bool isOn() override;

private:
    int pin;
    bool status{false};
};

#endif