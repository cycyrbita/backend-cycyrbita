const {Schema, model} = require('mongoose')

const IngredientThemeSchema = new Schema({
  theme: {type: String}
})

module.exports = model('IngredientTheme', IngredientThemeSchema)