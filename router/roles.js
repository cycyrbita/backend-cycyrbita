const Router = require('express').Router
const roleController = require('../controllers/role-controller')
const roles = new Router()
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth-middleware')
const permissionsMiddleware = require('../middleware/permissions-middleware')

roles.get('/roles', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['roles']), roleController.getRoles)
roles.post('/set-role', authMiddleware, body('name', 'Поле не может быть пустым').notEmpty(), (req, res, next) => permissionsMiddleware(req, res, next, ['roles']), roleController.setRole)
roles.post('/delete-role', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['roles']), roleController.deleteRole)
roles.get('/permissions', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['permissions']), roleController.getPermissions)
roles.post('/set-permission', authMiddleware, body('name', 'Поле не может быть пустым').notEmpty(), (req, res, next) => permissionsMiddleware(req, res, next, ['permissions']), roleController.setPermission)
roles.post('/delete-permission', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['permissions']), roleController.deletePermission)

module.exports = roles