const {Schema, model} = require('mongoose')

const UserSchema = new Schema({
    nickName: {type: String, require: true, default: 'Кукурбит'},                // nickName
    firstName: {type: String, require: true, default: 'Неопознанная Кукурбита'}, // Имя
    lastName: {type: String, require: true, default: 'Нет'},                     // Фамилия
    age: {type: String, require: true, default: 'Нет'},                          // Возраст
    avatarImg: {type: String, default: "avatar-default.png"},                    // Аватарка
    email: {type: String, unique: true, require: true},                          // Почта
    password: {type: String, require: true},                                     // Пароль
    roles: {type: Array, default: []},
    permissions: {type: Array, default: []},
    isActivated: {type: Boolean, default: false},                                // Активация аккаунта через почту
    activationLink: {type: String},                                              // Ссылка которая приходит на почту для активации
    isRecoveryPassword: {type: Boolean, default: false},                         // Если нужно сменить пароль
    recoveryPasswordLink: {type: String},                                        // Ссылка для смены пароля
    edits: {type: Array, default: []},                                           // Список какие страницы можно редактировать
    lastActivityAt: { type: Date, default: Date.now },                           // Дата последней активности
    accountDeleted: {type: Boolean, default: false},                             // Блокировка аккаунта
})

module.exports = model('User', UserSchema.set('timestamps', true))