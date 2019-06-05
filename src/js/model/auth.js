export default class Auth {
  static fromJson(data = {}) {
    return {
      token: data.Token,
      expired: data.Expired
    };
  }
};