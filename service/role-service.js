const RoleModel = require('../models/role-model')
const PermissionModel = require('../models/permission-model')

class roleService {
    async getRoles() {
        return await RoleModel.find()
    }
    async setRole(role) {
        if(role._id) {
            return await RoleModel.findOneAndUpdate({ _id: role._id }, role, { upsert: true, new: true })
        }
        return await RoleModel.findOneAndUpdate({ name: role.name }, role, { upsert: true, new: true })
    }
    async getPermissions() {
        return await PermissionModel.find()
    }

    async setPermission(permission) {
        if(permission._id) {
            return await PermissionModel.findOneAndUpdate({ _id: permission._id }, permission, { upsert: true, new: true })
        }
        return await PermissionModel.findOneAndUpdate({ name: permission.name }, permission, { upsert: true, new: true })
    }

    async deletePermission({_id}) {
        await PermissionModel.deleteOne({ _id })
    }
}

module.exports = new roleService()