module.exports = class UserDto {
    id;
    nickName;
    firstName;
    lastName;
    age;
    avatarImg;
    email;
    role;
    isActivated;
    isRecoveryPassword;
    edits;
    lastActivityAt;
    accountDeleted;

    constructor(model) {
        this.id = model._id;
        this.firstName = model.firstName;
        this.nickName = model.nickName;
        this.lastName = model.lastName;
        this.age = model.age;
        this.avatarImg = model.avatarImg;
        this.email = model.email;
        this.role = model.role;
        this.isActivated = model.isActivated;
        this.isRecoveryPassword = model.isRecoveryPassword;
        this.edits = model.edits;
        this.lastActivityAt = model.lastActivityAt;
        this.accountDeleted = model.accountDeleted;
    }
}