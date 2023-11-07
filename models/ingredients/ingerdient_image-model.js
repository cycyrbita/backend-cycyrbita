const {Schema, model} = require('mongoose')

const IngredientImageSchema = new Schema({
  src: {type: String},
  alt: {type: String}
})

module.exports = model('IngredientImage', IngredientImageSchema.set('timestamps', true))