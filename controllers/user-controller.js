require('dotenv').config({ path: '../.env' })
const userService = require('../service/user-service')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')

class UserController {
    async registration(req, res, next) {
        try {
            // проверка на ошибки
            const errors = validationResult(req)

            if(!errors.isEmpty()) return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))

            // получаем email и password
            const {email, password, firstName} = req.body

            // вызывваем функцию и регистрируем пользователя
            const userData = await userService.registration(email, password, firstName)

            // записываем в куки
            res.cookie('accessToken', userData.accessToken, {maxAge: 60000, httpOnly: true})
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.json({accessToken: userData.accessToken, user: userData.user})
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            // получаем почту и пароль
            const {email, password} = req.body

            // запускаем функцию и передаем параметры
            const userData = await userService.login(email, password)

            // записываем в куки токен
            res.cookie('accessToken', userData.accessToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.json({accessToken: userData.accessToken, user: userData.user})
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            // получаем рефрештокен из кук
            const {refreshToken, accessToken} = req.cookies
            // вызываем функцию и передаем рефрештокен
            await userService.logout(refreshToken, accessToken)

            // удаляем куку с рефрештокеном
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')
            res.clearCookie('accessToken')
            return res.json()

        } catch (e) {
            next(e)
        }
    }

    async activate(req, res, next) {
        try {
            // получаем ссылку активации
            const activationLink = req.params.link

            // вызываем функцию и передаем ей ссылку активации
            await userService.activate(activationLink)

            return res.redirect(`${process.env.CLIENT_URL}/login`)
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies

            // запускаем функцию и передаем рефрештокен
            const userData = await userService.refresh(refreshToken)

            // записываем в куки токен
            res.cookie('accessToken', userData.accessToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.json({accessToken: userData.accessToken, user: userData.user})
        } catch (e) {
            next(e)
        }
    }

    async getUser(req, res, next) {
        try {
            // получаем почту
            const { email } = req.body
            return res.json(await userService.getUser(email))
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            return res.json(await userService.getUsers())
        } catch (e) {
            next(e)
        }
    }

    async updateUser(req, res, next) {
        try {
            return res.json(await userService.updateUser(req.body))
        } catch (e) {
            next(e)
        }
    }

    async deleteUser(req, res, next) {
        try {
            return res.json(await userService.deleteUser(req.body))
        } catch (e) {
            next(e)
        }
    }

    async lastActivityAt(req, res, next) {
        try {
            // получаем почту
            const {email} = req.body
            // вызываем функцию обновления даты
            const newData = await userService.lastActivityAt(email)

            return res.json({message: `Дата последнего входа ${newData}`})
        } catch (e) {
            next(e)
        }
    }

    // функция отправки письма на почту для восстановления пароля
    async addRecoveryPasswordLink(req, res, next) {
        try {
            // получаем почту
            const {email} = req.body

            // вызываем функцию проверки и отправки ссылки на почту
            await userService.addRecoveryPasswordLink(email)

            // возвращаем ответ
            return res.json({message: 'Загялните в почту'})
        } catch (e) {
            next(e)
        }
    }

    // функция отрабатывает когда переходим по ссылке которая приходит на почту
    async redirectRecoveryPassword(req, res, next) {
        try {
            // получаем ссылку восстановления пароля
            const recoveryPasswordLink = req.params.link

            // функция для проверки и смены флага восстановления пароля
            await userService.redirectRecoveryPassword(recoveryPasswordLink)

            // редиректим на восстановление пароля
            return res.redirect(`${process.env.CLIENT_URL}/recovery-password`)
        } catch (e) {
            next(e)
        }
    }

    // отрабатывает когда придумываем новый пароль
    async recoveryPassword(req, res, next) {
        try {
            // проверка на ошибки
            const errors = validationResult(req)

            if(!errors.isEmpty()) return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))

            // получаем почту и пароль
            const {email, password} = req.body

            // отрабатывает когда придумываем новый пароль
            await userService.recoveryPassword(email, password)

            // редиректим на главную
            return res.json({message: 'Пароль изменен!'})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()
