const {Schema, model} = require('mongoose')

const IngredientSchema = new Schema({
  countrys: {type: Array, require: true, default: [{type: Schema.Types.ObjectId, ref: 'IngredientCountry'}]},
  themes: {type: Array, require: true, default: [{type: Schema.Types.ObjectId, ref: 'IngredientTheme'}]},
  titles: {type: Array, require: true, default: [{type: Schema.Types.ObjectId, ref: 'IngredientTitle'}]},
  descriptions: {type: Array, require: true, default: [{type: Schema.Types.ObjectId, ref: 'IngredientDescription'}]},
  tags: {type: Array, require: true, default: [{type: Schema.Types.ObjectId, ref: 'IngredientTag'}]},
  images: {type: Array, require: true, default: [{type: Schema.Types.ObjectId, ref: 'IngredientImage'}]}
})

module.exports = model('Ingredient', IngredientSchema.set('timestamps', true))