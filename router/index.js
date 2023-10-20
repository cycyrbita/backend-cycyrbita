const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth-middleware')
const adminMiddleware = require('../middleware/admin-middleware')

router.post('/registration', body('email').isEmail(), body('password').isLength({min: 8, max: 32}), userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refresh)

// обновление даты последней активности
router.post('/last-activity-at', authMiddleware, userController.lastActivityAt)

router.post('/add-recovery-password-link', userController.addRecoveryPasswordLink)
router.get('/redirect-recovery-password/:link', userController.redirectRecoveryPassword)
router.post('/recovery-password', body('password').isLength({min: 8, max: 32}), userController.recoveryPassword)

// Активация аккаунта
router.get('/activate/:link', userController.activate)

// список пользователей
router.post('/users', authMiddleware, adminMiddleware, userController.getUsers)
router.delete('/delete-user', authMiddleware, adminMiddleware, userController.deleteUser)
router.post('/restore-user', authMiddleware, adminMiddleware, userController.restoreUser)
router.post('/edit-role', authMiddleware, adminMiddleware, userController.editRole)

module.exports = router