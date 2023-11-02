const sharp = require('sharp')
const path = require('path')

class IngredientController {
    async create(req, res, next) {
        try {
            await sharp(req.file.path)
                .resize(100, 100)
                .jpeg({ quality: 90 })
                .toFile(path.resolve(req.file.destination, 'resized', req.file.filename))

            return res.json(req.file)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()