import { useRef, useState } from 'react'
import Button from './Button'
import './ImageUploadField.css'
import { Upload, X } from 'lucide-react'

export default function ImageUploadField({
  label = 'Image',
  helpText = 'JPEG, PNG ou WebP (max 5MB)',
  value,
  onChangeUrl,
  uploadFn,
  disabled
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const pickFile = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const result = await uploadFn(file)
      onChangeUrl?.(result?.url || '')
    } catch (err) {
      const status = err?.response?.status
      const serverError = err?.response?.data?.error
      const message = serverError || err?.message || 'Upload échoué'

      console.error('Upload failed', {
        status,
        message,
        error: err
      })
      alert(status ? `Upload échoué (${status}) : ${message}` : `Upload échoué : ${message}`)
    } finally {
      setUploading(false)
      // allow picking same file again
      e.target.value = ''
    }
  }

  const clear = () => {
    onChangeUrl?.('')
  }

  return (
    <div className="image-upload-field">
      <div className="image-upload-header">
        <div>
          <div className="image-upload-label">{label}</div>
          {helpText && <div className="image-upload-help">{helpText}</div>}
        </div>

        <div className="image-upload-actions">
          {value ? (
            <>
              <Button type="button" variant="secondary" onClick={pickFile} icon={<Upload size={16} />} disabled={disabled || uploading}>
                Remplacer
              </Button>
              <Button type="button" variant="danger" onClick={clear} icon={<X size={16} />} disabled={disabled || uploading}>
                Retirer
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={pickFile} icon={<Upload size={16} />} disabled={disabled || uploading}>
              {uploading ? 'Upload…' : 'Uploader'}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        className="image-upload-input"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={disabled || uploading}
      />

      {value && (
        <div className="image-upload-preview">
          <img src={value} alt="Prévisualisation" />
        </div>
      )}
    </div>
  )
}
