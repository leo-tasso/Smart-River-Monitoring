#ifndef __DISPLAY_FEEDBACK__
#define __DISPLAY_FEEDBACK__

#include "WaterChannelController.h"
#include "actuators/Display.h"
#include "system/task.h"

class DisplayFeedback : public Task {
   private:
    WaterChannelController *waterChannelController;
    Display *lcd;
    unsigned short colDisplay;

   public:
    DisplayFeedback(int period,
                    WaterChannelController *WaterChannelController,
                    uint8_t lcd_Addr,
                    uint8_t lcd_cols,
                    uint8_t lcd_rows);
    void tick() override;
};
#endif