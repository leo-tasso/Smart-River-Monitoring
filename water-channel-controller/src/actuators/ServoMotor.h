#ifndef _SERVO_MOTOR_
#define _SERVO_MOTOR_

class ServoMotor{
    
public:
    virtual void on() = 0;
    virtual void off() = 0;
    virtual void setPosition(int angle) = 0;
};

#endif