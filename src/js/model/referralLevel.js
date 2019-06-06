export default class ReferralLevel {
  static fromJson(data = {}) {
    return {
      name: data.Name,
      title: data.Title,
      desc: data.Desc,
      nums: data.Nums,
      got: data.Got,
    };
  }
};