#ifndef __ACTUATOR__
#define __ACTUATOR__

#include "WaterChannelController.h"
#include "actuators/ServoMotor.h"
#include "system/task.h"
#include "system/taskWithState.h"

enum class ActuatorStates { Idle,
                            Moving };

class Actuator : public TaskWithState<ActuatorStates> {
   private:
    WaterChannelController* waterChannelController;
    ServoMotor* motor;
    unsigned int timeToMove{TIME_TO_MOVE};

   public:
    Actuator(int period, WaterChannelController* WaterChannelController, int servoPin);
    void tick() override;
};

#endif