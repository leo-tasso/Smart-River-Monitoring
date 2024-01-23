#ifndef __WATERCHANNELCONTROLLER__
#define __WATERCHANNELCONTROLLER__

enum class Mode { AUTO,
                  MANUAL };

class WaterChannelController {
   public:
    bool commChange;
    bool posChange;
    Mode activeMode;
    unsigned int activePosition;
};

#endif