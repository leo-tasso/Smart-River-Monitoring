#ifndef __POTENTIOMETERIMPL__
#define __POTENTIOMETERIMPL__

#include "Potentiometer.h"

class PotentiometerImpl : public Potentiometer {
   public:
    PotentiometerImpl(int pin, int tollerance);
    unsigned int position() override;
    bool moved() override;

   private:
    int pin;
    int tollerance;
    unsigned int oldValue;
};

#endif
