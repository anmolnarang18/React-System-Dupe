import { SHIFT_STATUS } from "../shared/Constants";

export const decideShiftClr = (status) => {
  switch (status) {
    case SHIFT_STATUS.NOT_ASSIGNED:
      return "orange";

    case SHIFT_STATUS.CONFIRMED:
      return "blue";

    case SHIFT_STATUS.COMPLETED:
      return "green";

    default:
      return "red";
  }
};


export const decidingShiftType = time => {
  
  if(time < '12:00:00' && time>'6:00:00'){
    return 'Morning Shift'
  }else if(time>='12:00:00' && time<'17:00:00'){
    return 'Afternoon Shift'
  }else if(time>='17:00:00' && time<'20:00:00'){
    return 'Evening Shift'
  }else{
    return 'Night Shift'
  }
}





