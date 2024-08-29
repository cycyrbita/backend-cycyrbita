const {Schema, model} = require('mongoose')

const NewPromoTitleSchema = new Schema({
    title: {type: String},
})

module.exports = model('NewPromoTitle', NewPromoTitleSchema.set('timestamps', true))