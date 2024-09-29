const newPromo = require('express').Router()
const newPromoController = require('../controllers/new-promo-controller')
const authMiddleware = require('../middleware/auth-middleware')

newPromo.get('/get-new-promo', authMiddleware, newPromoController.getNewPromo)
newPromo.get('/download-new-promo', authMiddleware, newPromoController.downloadNewPromo)
newPromo.post('/update-new-promo', authMiddleware, newPromoController.updateNewPromo)
newPromo.post('/upload-archive', authMiddleware, newPromoController.uploadArchive)
newPromo.post('/create-screenshot', authMiddleware, newPromoController.createScreenShot)
newPromo.delete('/delete-new-promo', authMiddleware, newPromoController.deleteNewPromo)

module.exports = newPromo