#ifndef __COMMUNICATOR__
#define __COMMUNICATOR__

#include "WaterChannelController.h"
#include "actuators/Light.h"
#include "system/task.h"

class Communicator : public Task {
   private:
    WaterChannelController* waterChannelController;
    Light* greenLed;
    Light* redLed;
    unsigned long int lastMessage{0};

   public:
    Communicator(int period, WaterChannelController* WaterChannelController, int greenLedPin, int redLedPin);
    void tick() override;
};

#endif