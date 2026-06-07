import { api } from '../services/api/client'

/**
 * Upload a File object to MinIO and return the persistent URL.
 * Falls back to base64 data URL if the API is unavailable.
 *
 * Usage:
 *   const url = await uploadFile(file, 'projects', 'photo-chantier')
 *   // url = "http://localhost:9000/meereo-files/projects/abc123.png"
 *
 * @param {File} file - File object from <input type="file">
 * @param {string} folder - MinIO subfolder (projects, documents, products, avatars)
 * @param {string} name - Optional name hint
 * @returns {Promise<string>} The persistent URL
 */
export async function uploadFile(file, folder = 'uploads', name) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      try {
        const result = await api.upload.file(base64, folder, name || file.name)
        resolve(result.url)
      } catch (e) {
        // Fallback: return the base64 data URL (works locally but not persistent)
        console.warn('[MEEREO upload] MinIO unavailable, using local base64:', e.message)
        resolve(base64)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Upload a base64 string directly (when you already have the data URL).
 * @param {string} base64 - data:image/...;base64,...
 * @param {string} folder
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function uploadBase64(base64, folder = 'uploads', name = 'file') {
  try {
    const result = await api.upload.file(base64, folder, name)
    return result.url
  } catch (e) {
    console.warn('[MEEREO upload] MinIO unavailable, using local base64:', e.message)
    return base64
  }
}
