import { toast } from 'react-toastify';

export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const showWarningToast = (message) => {
  toast.warn(message, {
    position: "top-right",
    // Customize options
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    // Customize options
  });
};