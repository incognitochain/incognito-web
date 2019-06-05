import storage from '../service/storage';
import KEYS from "../constant/keys";

const checkAuth = () => {
  const token = storage.get(KEYS.TOKEN);

  if (token && location.pathname === '/') {
    location.pathname = '/referral.html';
  }
}

const main = () => {
  checkAuth();
};

main();