const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'assets/ingredients')
  },
  filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Math.random() + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
  }
})

const types = ['image/png', 'image/jpeg', 'image/jpg']

const fileFilter = (req, file, cb) => {
  if(types.includes(file.mimetype)) return cb(null, true)
  return cb(null, false)
}

module.exports = multer({storage, fileFilter})