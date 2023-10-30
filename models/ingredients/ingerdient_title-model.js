const {Schema, model} = require('mongoose')

const IngredientTitleSchema = new Schema({
  title: {type: String},
  language: {type: String}
})

module.exports = model('IngredientTitle', IngredientTitleSchema.set('timestamps', true))