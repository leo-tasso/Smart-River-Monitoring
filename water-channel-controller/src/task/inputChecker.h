#ifndef __INPUTCHECKER__
#define __INPUTCHECKER__

#include "WaterChannelController.h"
#include "system/taskWithState.h"
#include "system/task.h"
#include "actuators/ServoMotor.h"
#include "sensors/Button.h"
#include "sensors/Potentiometer.h"



class InputChecker : public Task {
   private:
    WaterChannelController* waterChannelController;
    unsigned int oldPotPos; 
    bool pressed; 
    Button* button;
    Potentiometer* potentiometer;




   public:
    InputChecker(int period, WaterChannelController* WaterChannelController, int buttonPin, int potPin);
    void tick() override;
};

#endif