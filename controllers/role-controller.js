const roleService = require('../service/role-service')

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
            const permission = req.body

            return res.json(await roleService.setPermission(permission))
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new RoleController()