const {Schema, model} = require('mongoose')

const IngredientCountrySchema = new Schema({
  country: {type: String},
})

module.exports = model('IngredientCountry', IngredientCountrySchema.set('timestamps', true))