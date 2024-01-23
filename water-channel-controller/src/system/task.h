#ifndef __TASK__
#define __TASK__

class Task {

public:
  virtual void tick() = 0;

  bool updateAndCheckTime(int basePeriod){
    timeElapsed += basePeriod;
    if (timeElapsed >= myPeriod){
      timeElapsed = 0;
      return true;
    } else {
      return false; 
    }
  }

protected:
  Task(int period) : myPeriod(period)
  {
  }

private:

  int myPeriod;
  int timeElapsed{0};
};

#endif