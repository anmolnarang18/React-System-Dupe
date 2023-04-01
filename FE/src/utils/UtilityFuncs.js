import { TASK_STATUS } from "../shared/Constants";

export const showTaskStatus = (status) => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return "Start";

    case TASK_STATUS.IN_PROGRESS:
      return "Complete";

    default:
      return "Stopped";
  }
};

export const decideTaskClr = (status) => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return "orange";

    case TASK_STATUS.IN_PROGRESS:
      return "blue";

    case TASK_STATUS.COMPLETED:
      return "green";

    default:
      return "red";
  }
};

export const decideTaskStatusChange = (status) => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return TASK_STATUS.IN_PROGRESS;

    case TASK_STATUS.IN_PROGRESS:
      return TASK_STATUS.COMPLETED;

    default:
      return TASK_STATUS.TERMINATED;
  }
};

export const handleSort = (data, isAsc) => {
  const list = [...data];
  if (isAsc) {
    return list.sort((a, b) => {
      return a.totalHours * a.perHourCost < b.totalHours * b.perHourCost;
    });
  } else {
    return list.sort((a, b) => {
      return a.totalHours * a.perHourCost > b.totalHours * b.perHourCost;
    });
  }
};
