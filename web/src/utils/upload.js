import { api } from '../services/api/client'

// R8 — Limites de taille par type de fichier (en octets)
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,       // 5 Mo
  document: 20 * 1024 * 1024,   // 20 Mo
  default: 10 * 1024 * 1024,    // 10 Mo
}

/**
 * R8 — Valide la taille d'un fichier avant upload.
 * @param {File} file
 * @throws {Error} si le fichier dépasse la taille maximale
 */
export function validateFileSize(file) {
  if (!file || !file.size) return
  const isImage = file.type?.startsWith('image/')
  const isDoc = file.type === 'application/pdf' || file.name?.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|dwg|dxf)$/i)
  const max = isImage ? MAX_FILE_SIZES.image : isDoc ? MAX_FILE_SIZES.document : MAX_FILE_SIZES.default
  if (file.size > max) {
    const maxMB = Math.round(max / (1024 * 1024))
    const fileMB = (file.size / (1024 * 1024)).toFixed(1)
    throw new Error(`Le fichier (${fileMB} Mo) dépasse la taille maximale autorisée (${maxMB} Mo)`)
  }
}

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
  validateFileSize(file)
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
