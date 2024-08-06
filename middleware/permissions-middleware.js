const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next, data = []) {
    try {
        // достаем токен из заголовка
        const accessToken = req.cookies.accessToken

        // проверяем есть ли токен
        if(!accessToken) return next(ApiError.UnauthorizedError())

        // запускаем функцию проверки токена
        const user = tokenService.validateAccessToken(accessToken)

        // если при валидации токена произошла ошибка
        if(!user) return next(ApiError.UnauthorizedError())

        // проверяем есть ли в объекте ключи
        if(!Object.keys(user).length) return next(ApiError.BadRequest('Не передали пользователя'))

        // сравниваем массивы у пользователя и у массива data, если нет совпадений то выходим
        if (!user?.permissions?.some(el => data.includes(el.name))) return next(ApiError.Forbidden('Нет доступа'))

        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}