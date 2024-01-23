#ifndef __SCHEDULER__
#define __SCHEDULER__
#include "task.h"
constexpr int MAX_TASKS = 10;
class Scheduler {

 int basePeriod;
 int nTasks{0};
 Task* taskList[MAX_TASKS]{};
public:

 Scheduler(int basePeriod);
 virtual bool addTask(Task* task);
 virtual void schedule();

};
#endif