import nextConnect from 'next-connect'
import { isAuth, isAdmin } from '../../../helpers/auth'
import { onError } from '../../../helpers/error'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

// Configuration of cloudinary with keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = nextConnect({ onError })
const upload = multer()
/**
 * Parse authentication, adminand upload middleware
 */

handler.use(isAuth, isAdmin, upload.single('file')).post(async (req, res) => {
  const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
          console.log('error', error)
        }
      })
      streamifier.createReadStream(req.file.buffer).pipe(stream)
    })
  }
  const result = await streamUpload(req)
  res.send(result)
})

export default handler
