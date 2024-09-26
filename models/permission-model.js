const {Schema, model} = require('mongoose')

const PermissionSchema = new Schema({
    name: {type: String, require: true},
})

module.exports = model('Permission', PermissionSchema.set('timestamps', true))