#ifndef __POTENTIOMETER__
#define __POTENTIOMETER__

class Potentiometer {
   public:
    virtual unsigned int position() = 0;
    virtual bool moved() = 0;

};

#endif
