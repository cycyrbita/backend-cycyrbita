const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')
const UserModel = require('../models/user-model')

module.exports = async function (req, res, next, data = []) {
    try {
        // достаем токен из заголовка
        const accessToken = req.cookies.accessToken

        // проверяем есть ли токен
        if(!accessToken) return next(ApiError.UnauthorizedError())

        // запускаем функцию проверки токена
        let user = tokenService.validateAccessToken(accessToken)

        // проверяем есть ли в объекте ключи
        if(!Object.keys(user).length) return next(ApiError.BadRequest('Не передали пользователя'))

        // достаем пользователя по email из базы
        user = await UserModel.findOne({email: user.email}).populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }
        }).populate('permissions')

        // проверка на существования в базе пользователя
        if(!user) return next(ApiError.BadRequest(`Пользователь с почтовым адресом ${user.email} не найден`))

        // сравниваем массивы у пользователя и у массива data, если нет совпадений то выходим
        if (!user?.permissions?.some(el => data.includes(el.name))) return next(ApiError.Forbidden())

        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}