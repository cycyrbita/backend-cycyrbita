const {Schema, model} = require('mongoose')

const IngredientTitleSchema = new Schema({
  title: {type: String},
  country: {type: String},
  code: {type: String},
})

module.exports = model('IngredientTitle', IngredientTitleSchema)