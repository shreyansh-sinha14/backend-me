import multer from 'multer' // Import multer for handling file uploads

const storage = multer.diskStorage({ // configure storage settings
  destination: function (req, file, cb) {
    cb(null, './public/temp') // specify the destination directory
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname) // use the original file name as uploaded by user
  }
})

export const upload = multer({ storage: storage }) // export the configured multer instance

