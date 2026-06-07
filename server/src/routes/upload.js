import { Router } from 'express'
import { Client as MinioClient } from 'minio'
import crypto from 'crypto'

export const BUCKET = process.env.MINIO_BUCKET || 'meereo-files'

export const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'meereo',
  secretKey: process.env.MINIO_SECRET_KEY || 'meereo_dev_2025',
})

// Ensure bucket exists on startup
async function ensureBucket() {
  const exists = await minio.bucketExists(BUCKET)
  if (!exists) {
    await minio.makeBucket(BUCKET)
    // Public read policy so images are accessible via URL
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      }],
    }
    await minio.setBucketPolicy(BUCKET, JSON.stringify(policy))
    console.log(`  📦 Bucket "${BUCKET}" created with public read policy`)
  }
}
ensureBucket().catch(e => console.warn('MinIO bucket init:', e.message))

export default function uploadRouter() {
  const router = Router()

  /**
   * POST /api/upload
   * Body: { file: "data:image/png;base64,...", folder: "projects", filename: "photo.png" }
   * Returns: { url: "http://localhost:9000/meereo-files/projects/abc123.png" }
   */
  router.post('/', async (req, res) => {
    try {
      const { file, folder, filename } = req.body
      if (!file) return res.status(400).json({ error: 'No file provided' })

      // Parse base64 data URL
      const matches = file.match(/^data:(.+);base64,(.+)$/)
      if (!matches) return res.status(400).json({ error: 'Invalid file format. Expected base64 data URL.' })

      const contentType = matches[1]
      const buffer = Buffer.from(matches[2], 'base64')

      // Generate unique filename
      const ext = contentType.split('/')[1] || 'bin'
      const hash = crypto.randomBytes(8).toString('hex')
      const dir = folder || 'uploads'
      const objectName = `${dir}/${hash}_${filename || 'file'}.${ext}`

      // Upload to MinIO
      await minio.putObject(BUCKET, objectName, buffer, buffer.length, { 'Content-Type': contentType })

      const proto = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
      const host = process.env.MINIO_ENDPOINT || 'localhost'
      const port = process.env.MINIO_PORT || '9000'
      const url = `${proto}://${host}:${port}/${BUCKET}/${objectName}`
      res.status(201).json({ url, objectName, size: buffer.length, contentType })
    } catch (e) {
      console.error('Upload error:', e)
      res.status(500).json({ error: e.message })
    }
  })

  /**
   * DELETE /api/upload/:objectName
   * Deletes a file from MinIO
   */
  router.delete('/:objectName', async (req, res) => {
    try {
      await minio.removeObject(BUCKET, req.params.objectName)
      res.status(204).end()
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  return router
}
