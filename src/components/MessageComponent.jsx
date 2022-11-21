import { message } from "antd";
  
export const showMessage = (msg, type = "error") => {
    message[type](msg);
};