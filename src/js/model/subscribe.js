export default class Subscribe {
  static fromJson(data = {}) {
    return {
      id: data.ID,
      createdAt: data.CreatedAt,
      updatedAt: data.UpdatedAt,
      deletedAt: data.DeletedAt,
      user: data.User,
      userID: data.UserID,
      email: data.Email,
      code: data.Code,
      referralCode: data.ReferralCode,
      referralID: data.ReferralID
    };
  }
};