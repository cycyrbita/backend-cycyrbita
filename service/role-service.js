const RoleModel = require('../models/role-model')
const UserModel = require('../models/user-model')
const PermissionModel = require('../models/permission-model')

class roleService {
    async getRoles() {
        return await RoleModel.find().populate('permissions')
    }
    async setRole(role) {
        if(role._id) {
            const deleteRole = await RoleModel.findOneAndUpdate({ _id: role._id }, role, { upsert: true, new: true })

            // смысл в том, чтобы при обновлении роли, так же удалялись доступы данной роли у пользователей
            let users = await UserModel.find().populate('roles')
            for(const user of users) {
                let permissions = []
                if(!user.roles.length) user.permissions = []
                for(const role of user.roles) {
                    for(const permission of role.permissions) {
                        permissions.push(permission)
                        user.permissions = [...permissions, ...user.permissions]
                        user.permissions = user.permissions.filter((perm, index) => user.permissions.indexOf(perm) === index)
                    }
                }
                await user.save()
            }
            return {...deleteRole, ...{statusInfo: 'update'}}
        }
        return {...await RoleModel.findOneAndUpdate({name: role.name}, role, {upsert: true, new: true}), ...{statusInfo: 'create'}}
    }

    async deleteRole({_id}) {
        // удаляем роли у пользователей
        let users = await UserModel.find().populate('roles')
        for(const user of users) {
            await UserModel.findOneAndUpdate({ _id: user._id }, { $pull: { roles: _id} } )
        }

        users = await UserModel.find().populate('roles')

        // смысл в том, чтобы при удалении роли, так же удалялись доступы данной роли у пользователей
        for(const user of users) {
            let permissions = []
            if(!user.roles.length) user.permissions = []
            for(const role of user.roles) {
                for(const permission of role.permissions) {
                    permissions.push(permission)
                    user.permissions = [...permissions, ...user.permissions]
                    user.permissions = user.permissions.filter((perm, index) => user.permissions.indexOf(perm) === index)
                }
            }
            await user.save()
        }

        await RoleModel.deleteOne({ _id })
    }

    async getPermissions() {
        return await PermissionModel.find()
    }

    async setPermission(permission) {
        if(permission._id) {
            return {...await PermissionModel.findOneAndUpdate({ _id: permission._id }, permission, { upsert: true, new: true }), ...{statusInfo: 'update'}}
        }
        return {...await PermissionModel.findOneAndUpdate({ name: permission.name }, permission, { upsert: true, new: true }), ...{statusInfo: 'create'}}
    }

    async deletePermission({_id}) {
        // удаляем доступ
        await PermissionModel.deleteOne({ _id })

        // удаляем доступ у ролей
        let roles = await RoleModel.find()
        for(const role of roles) {
            await RoleModel.findOneAndUpdate({ _id: role._id }, { $pull: { permissions: _id} } )
        }

        // удаляем доступ у пользователей
        let users = await UserModel.find()
        for(const user of users) {
            await UserModel.findOneAndUpdate({ _id: user._id }, { $pull: { permissions: _id} } )
        }
    }
}

module.exports = new roleService()
