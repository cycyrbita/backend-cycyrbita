const Router = require('express').Router
const roleController = require('../controllers/role-controller')
const roles = new Router()
const authMiddleware = require('../middleware/auth-middleware')
const permissionsMiddleware = require('../middleware/permissions-middleware')

roles.get('/roles', roleController.getRoles)
roles.post('/role', roleController.setRole)
roles.get('/permissions', roleController.getPermissions)
roles.post('/permission', roleController.setPermission)

module.exports = roles