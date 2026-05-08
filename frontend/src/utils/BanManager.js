let listeners = [];

export const subscribeBan = (callback) => {
  listeners.push(callback);
};

export const triggerBan = () => {
  listeners.forEach((cb) => cb(true));
};