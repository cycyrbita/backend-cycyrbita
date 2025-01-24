require('dotenv').config({ path: '../.env' })
const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password, firstName) {
        // поиск пользователя в базе
        const candidate = await UserModel.findOne({email})

        // проверка на существования в базе пользователя
        if(candidate) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)

        // хешируем пароль
        const hashPassword = await bcrypt.hash(password, 3)

        // получаем рандомную строку для генерации ссылки активации аккаунта
        const activationLink = uuid.v4()

        // создаем пользователя
        const user = await UserModel.create({email, password: hashPassword, activationLink, firstName})

        // фильтруем объект и отдаем только те данные которые прописаны в dto
        const userDto = new UserDto(user)

        // генерируем токены
        const tokens = tokenService.generateTokens({...userDto})

        // сохраняем токены в базу
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        // отправляем письмо для активации
        try {
            mailService.sendActivationMail(email, `${process.env.API_URL}api/activate/${activationLink}`)
        } catch (e) {
            throw ApiError.BadRequest(`Ошибка отправки отправки письма ${e}`)
        }

        return {...tokens}
    }

    async activate(activationLink) {
        // поиск пользователя по ссылке
        const user = await UserModel.findOne({activationLink})

        // проверка на существование пользователя
        if(!user) throw ApiError.BadRequest('Неккоректная ссылка активации')

        // меняем состояние акккаунта
        user.isActivated = true

        // сохраняем
        await user.save()
    }

    async login(email, password) {
        // поиск пользователя в базе
        const user = await UserModel.findOne({email})

        // проверка на существования в базе пользователя
        if(!user) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не найден`)

        // проверка на блокировку
        if(user.accountDeleted) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} заблокирован`)

        // функция compare принимает пароль который ввели и хеширует его, затем вторым параметром передаем пароль с базы в хешированном виде и сравнивает их
        const isPassEquals = await bcrypt.compare(password, user.password)

        // если пароли не равны
        if(!isPassEquals) throw ApiError.BadRequest('Неверный пароль')

        // фильтруем объект и отдаем только те данные которые прописаны в dto
        const userDto = new UserDto(user)

        // генерируем токены
        const tokens = tokenService.generateTokens({...userDto})

        // сохраняем токены в базу
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        // вызываем функцию удаления токена с базы
        const token = await tokenService.removeToken(refreshToken)

        return token
    }

    async refresh(refreshToken) {
        // проверяем есть ли токен
        if(!refreshToken) throw ApiError.UnauthorizedError('блять, в 5й раз нахуй проеверяем этот ебаный ацес токен ебаный')

        // вызываем функцию проверки токена
        const userData = tokenService.validateRefreshToken(refreshToken)

        // ищем токен в базе
        const tokenFromDb = await tokenService.findToken(refreshToken)

        // если токен протух или нет в базе
        if(!userData || !tokenFromDb) throw ApiError.UnauthorizedError('токен протух или нет в базе')

        // достаем пользователя по id из базы
        const user = await UserModel.findById(userData.id)

        // фильтруем объект и отдаем только те данные которые прописаны в dto
        const userDto = new UserDto(user)

        // проверка на удаление аккаунта
        if(userDto.accountDeleted) throw ApiError.UnauthorizedError('акк снесли')

        // генерируем токены
        const tokens = tokenService.generateTokens({...userDto})

        // сохраняем токены в базу
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async getUser(email) {
        const user = await UserModel.findOne({email}).populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }
        }).populate('permissions')
        if(user.accountDeleted) throw ApiError.UnauthorizedError('акк снесли, снова')
        return user
    }

    async getUsers() {
        return await UserModel.find().populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }
        }).populate('permissions')
    }

    async updateUser(user) {
        // хешируем пароль
        if(user.newPassword) {
            user.password = await bcrypt.hash(user.newPassword, 3)
            delete user.newPassword
        }
        return await UserModel.findOneAndUpdate({ _id: user._id }, user).populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }
        }).populate('permissions')
    }

    async deleteUser({_id}) {
        return await UserModel.deleteOne({ _id })
    }

    async lastActivityAt(email) {
        // поиск пользователя в базе
        const user = await UserModel.findOne({email})

        // создаем новую дату
        const newData = Date.now()

        // меняем дату последней активности
        user.lastActivityAt = newData

        // сохраняем
        user.save()

        return newData
    }

    // функция отправки письма на почту для восстановления пароля
    async addRecoveryPasswordLink(email) {
        // поиск пользователя в базе по почте
        const user = await UserModel.findOne({email})

        // проверка на существования в базе пользователя
        if(!user) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не найден`)

        // проверка на блокировку
        if(user.accountDeleted) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} заблокирован`)

        // получаем рандомную строку для генерации ссылки восстановления пароля
        const recoveryPasswordLink = uuid.v4()

        // присваиваем ссылку пользователю
        user.recoveryPasswordLink = recoveryPasswordLink

        // отправляем письмо для активации
        try {
            mailService.sendRecoveryPasswordMail(email, `${process.env.API_URL}api/redirect-recovery-password/${recoveryPasswordLink}`)
        } catch (e) {
            throw ApiError.BadRequest(`Ошибка отправки отправки письма ${e}`)
        }

        // сохраняем пользователя
        await user.save()
    }

    // функция отрабатывает когда переходим по ссылке которая приходит на почту
    async redirectRecoveryPassword(recoveryPasswordLink) {
        // поиск пользователя по ссылке восстановления пароля
        const user = await UserModel.findOne({recoveryPasswordLink})

        // проверка на существование пользователя
        if(!user) throw ApiError.BadRequest('Неккоректная ссылка восстановления пароля')

        // меняем флаг восстановления пароля
        user.isRecoveryPassword = true

        // сохраняем пользователя
        user.save()
    }

    // отрабатывает когда придумываем новый пароль
    async recoveryPassword(email, password) {
        // поиск пользователя в базе по почте
        const user = await UserModel.findOne({email})

        // проверка на существования в базе пользователя
        if(!user) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не найден`)

        // проверка на блокировку
        if(user.accountDeleted) throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} заблокирован`)

        // проверка флага восстановления пароля
        if(!user.isRecoveryPassword) throw ApiError.BadRequest(`Перейдите по почте`)

        // хешируем пароль
        const hashPassword = await bcrypt.hash(password, 3)

        // изменяем пароль
        user.password = hashPassword

        // меняем флаг восстановления пароля
        user.isRecoveryPassword = false

        // сохраняем в базу
        user.save()
    }
}

module.exports = new UserService()
