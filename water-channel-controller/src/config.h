#ifndef __CONFIG__
#define __CONFIG__

#define __DEBUG__
#include <Arduino.h>
constexpr int BASE_PERIOD = 100;
constexpr int POT_PIN = A0;
constexpr int BUTTON_PIN = 2;
constexpr int GREEN_LED_PIN = 4;
constexpr int RED_LED_PIN = 3;
constexpr int TIME_OUT_CONNECTION = 30000;

#endif