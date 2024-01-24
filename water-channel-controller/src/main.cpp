/*
 * ASSIGNMENT #3 - WATER CHANNEL CONTROLLER
 *
 * Authors: L. Tassinari
 *
 */
#include <Arduino.h>

#include "WaterChannelController.h"
#include "config.h"
#include "system/scheduler.h"
#include "task/communicator.h"
#include "task/displayFeedback.h"
#include "task/inputChecker.h"
#include "task/actuator.h"


Scheduler *sched;
WaterChannelController waterChannelController;

void setup() {
    sched = new Scheduler(BASE_PERIOD);
    // Initialize tasks and add to the scheduler.
    sched->addTask(new DisplayFeedback(150, &waterChannelController, 0x27, 16, 2));
    sched->addTask(new Communicator(200, &waterChannelController, GREEN_LED_PIN, RED_LED_PIN));
    sched->addTask(new InputChecker(100, &waterChannelController, BUTTON_PIN, POT_PIN));
    sched->addTask(new Actuator(105, &waterChannelController, SERVO_PIN));
}

void loop() {
    sched->schedule();
}