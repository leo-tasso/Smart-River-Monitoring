#include "displayFeedback.h"

#include "actuators/Lcd.h"

DisplayFeedback::DisplayFeedback(int period, WaterChannelController *waterChannelController, uint8_t lcd_Addr, uint8_t lcd_cols, uint8_t lcd_rows)
    : Task(period), waterChannelController(waterChannelController), lcd(new Lcd(lcd_Addr, lcd_cols, lcd_rows)), colDisplay(lcd_cols) {
    this->lcd->clear();
}

void DisplayFeedback::tick() {
    String msg = waterChannelController->activeMode == Mode::AUTO ? "Auto " : "Manual ";
    msg += waterChannelController->activePosition;
    this->lcd->show(msg);
}
