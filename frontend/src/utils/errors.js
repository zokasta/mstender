import { toast } from "react-toastify";

export const errorsDisplay = (error, toastCfg,message) => {
  console.error(`Error creating ${message}:`, error);
  console.log( error);

  if (error.response?.data?.errors) {
    Object.values(error.response.data.errors).forEach((msgs) =>
      toast.error(msgs[0], toastCfg)
    );
  }else if(error.response?.data?.message){
    toast.error(error.response?.data?.message)
  } else {
    toast.error(`Failed to create ${message}`, toastCfg);
  }
};
