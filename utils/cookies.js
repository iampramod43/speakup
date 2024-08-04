import { parseCookies } from 'nookies';

export const isUserLoggedIn = () => {
  const cookies = parseCookies();
  return !!cookies.authToken;
};
