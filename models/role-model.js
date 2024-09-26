const {Schema, model} = require('mongoose')

const RoleSchema = new Schema({
    name: {type: String, require: true},
    permissions: [{type: Schema.Types.ObjectId, ref: 'Permission'}],
})

module.exports = model('Role', RoleSchema.set('timestamps', true))