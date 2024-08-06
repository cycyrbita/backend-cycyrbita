const {Schema, model} = require('mongoose')

const RoleSchema = new Schema({
    name: {type: String, require: true},
    permissions: {type: Array, default: []},
})

module.exports = model('Role', RoleSchema.set('timestamps', true))