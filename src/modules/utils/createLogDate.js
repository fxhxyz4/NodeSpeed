import moment from "moment";

const createLogDate = () => {
  return moment().format("DD:MM:YYYY:HH:mm:ss");
}

export { createLogDate };
