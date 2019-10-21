import { signUp as signUpApi } from '../service/api';
import KEYS from '../constant/keys';
import storage from '../service/storage';

export const signUpAndSaveToStorage = async ({ name, email }) => {
  const token = await signUp({ name, email });

  if (token) {
    storage.set(KEYS.TOKEN, token);
    return true;
  }

  return false;
};

export const signUp = async ({ name, email }) => {
  const userData = await signUpApi({ name, email });
  if (userData) {
    return userData.Token;
  }

  return;
};
