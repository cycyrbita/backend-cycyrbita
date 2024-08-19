const roleService = require('../service/role-service')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')

class RoleController {
    async getRoles(req, res, next) {
        try {
            return res.json(await roleService.getRoles())
        } catch (e) {
            next(e)
        }
    }

    async setRole(req, res, next) {
        try {
            const role = req.body

            return res.json(await roleService.setRole(role))
        } catch (e) {
            next(e)
        }
    }

    async getPermissions(req, res, next) {
        try {
            return res.json(await roleService.getPermissions())
        } catch (e) {
            next(e)
        }
    }

    async setPermission(req, res, next) {
        try {
            // проверка на ошибки
            const errors = validationResult(req)
            if(!errors.isEmpty()) return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))

            return res.json(await roleService.setPermission(req.body))
        } catch (e) {
            next(e)
        }
    }

    async deletePermission(req, res, next) {
        try {
            return res.json(await roleService.deletePermission(req.body))
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new RoleController()