#include "actuator.h"

#include "actuators/ServoMotorImpl.h"

Actuator::Actuator(int period, WaterChannelController *waterChannelController, int servoPin)
    : TaskWithState(period), waterChannelController(waterChannelController), motor(new ServoMotorImpl(servoPin)) {
    this->motor->on();
    this->motor->setPosition(0);
    setState(ActuatorStates::Idle);
}

void Actuator::tick() {
    switch (this->getState()) {
        case ActuatorStates::Idle:
            if (this->waterChannelController->posChange) {
                this->motor->setPosition(map((int)this->waterChannelController->activePosition, 0, 100, 0, 180));
                this->waterChannelController->posChange = false;
            }
            break;
        case ActuatorStates::Moving:
            if (this->elapsedTimeInState() > this->timeToMove) {
                this->setState(ActuatorStates::Idle);
            }
            break;
        default:
            break;
    }
}
