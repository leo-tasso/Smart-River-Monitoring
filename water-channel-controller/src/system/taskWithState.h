#ifndef __TASK_WITH_STATE__
#define __TASK_WITH_STATE__

#include <Arduino.h>

#include "system/task.h"

template <typename T>
class TaskWithState : public Task {
   public:
    TaskWithState(int period)
        : Task(period) {
    }

   protected:
    void setState(T s) {
        state = s;
        stateTimestamp = millis();
    }

    T getState() {
        return this->state;
    }

    unsigned long elapsedTimeInState() {
        return millis() - stateTimestamp;
    }

   private:
    T state;
    unsigned long stateTimestamp{0};
};

#endif
