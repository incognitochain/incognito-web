import errorCode from '../constant/errorCode';

export const getErrorMessage = err => {
  return errorCode[err.Code];
};