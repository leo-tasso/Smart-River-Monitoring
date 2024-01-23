#ifndef __DISPLAY_CLASS__
#define __DISPLAY_CLASS__

#include <Arduino.h>


class Display {
public:
  virtual void clear() = 0;
  virtual void show(String msg) = 0;
  virtual void ln() = 0;
};

#endif