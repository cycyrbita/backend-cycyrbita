const Router = require('express').Router
const userController = require('../controllers/user-controller')
const user = new Router()
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth-middleware')
const permissionsMiddleware = require('../middleware/permissions-middleware')

user.post('/registration', body('email').isEmail(), body('password').isLength({min: 8, max: 32}), userController.registration)
user.post('/login', userController.login)
user.post('/logout', userController.logout)
user.get('/refresh', userController.refresh)

// обновление даты последней активности
user.post('/last-activity-at', authMiddleware, userController.lastActivityAt)

user.post('/add-recovery-password-link', userController.addRecoveryPasswordLink)
user.get('/redirect-recovery-password/:link', userController.redirectRecoveryPassword)
user.post('/recovery-password', body('password').isLength({min: 8, max: 32}), userController.recoveryPassword)

// Активация аккаунта
user.get('/activate/:link', userController.activate)

// список пользователей
user.post('/user', authMiddleware, userController.getUser)
user.post('/users', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['users']), userController.getUsers)
user.delete('/delete-user', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['users']), userController.deleteUser)
user.post('/restore-user', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['users']), userController.restoreUser)
user.post('/edit-role', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['users']), userController.editRole)

module.exports = user