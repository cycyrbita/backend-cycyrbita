const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    try {
        // достаем токен из заголовка
        const accessToken = req.cookies.accessToken

        // проверяем есть ли токен
        if(!accessToken) return next(ApiError.UnauthorizedError('проебан access token в auth-middleware'))

        // запускаем функцию проверки токена
        const userData = tokenService.validateAccessToken(accessToken)

        // если при валидации токена произошла ошибка
        if(!userData) return next(ApiError.UnauthorizedError('при валидации токена произошла ошибка в auth-middleware'))

        // если пользователь заблокирован
        if(userData.accountDeleted) return next(ApiError.UnauthorizedError('пользователь заблокирован в auth-middleware'))

        // помещаем в поле user данные о пользователе который лежал в токене
        req.user = userData

        // передаем управление следующему middleware
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError('auth-middleware упал'))
    }
}
