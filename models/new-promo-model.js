const {Schema, model} = require('mongoose')

const NewPromoSchema = new Schema({
    title: {type: String, require: true, default: 'Без названия'},
    lends: {type: Array, default: []},
    prelends: {type: Array, default: []},
    others: {type: Array, default: []},
})

module.exports = model('NewPromo', NewPromoSchema.set('timestamps', true))