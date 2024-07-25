const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    console.log('lal')
    try {
        // достаем токен из заголовка
        const authorizationHeader = req.cookies.accessToken

        // проверяем есть ли токен
        if(!authorizationHeader) return next(res.redirect(process.env.CLIENT_URL))

        // из токена забираем токен а "Bearer" отсеиваем
        const accessToken = authorizationHeader.split(' ')[1]
        // проверяем есть ли токен уже без "Bearer"
        if(!accessToken) return next(res.redirect(process.env.CLIENT_URL))

        // запускаем функцию проверки токена
        const userData = tokenService.validateAccessToken(accessToken)

        // если при валидации токена произошла ошибка
        if(!userData) return next(res.redirect(process.env.CLIENT_URL))

        // помещаем в поле user данные о пользователе который лежал в токене
        req.user = userData
        
        // передаем управление следующему middleware
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}