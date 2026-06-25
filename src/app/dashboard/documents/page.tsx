'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, File, Trash2, Loader2, FolderOpen, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface StorageFile {
  name: string
  created_at: string
  metadata: { size: number }
  url: string
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.storage.from('documents').list(user.id)
      if (data) {
        const withUrls = data.map(f => ({
          ...f,
          url: supabase.storage.from('documents').getPublicUrl(`${user.id}/${f.name}`).data.publicUrl,
        })) as StorageFile[]
        setFiles(withUrls)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB.'); return }

    setUploading(true)
    const path = `${userId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (error) {
      toast.error('Upload failed.')
    } else {
      toast.success('File uploaded!')
      const url = supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
      setFiles(prev => [...prev, { name: file.name, created_at: new Date().toISOString(), metadata: { size: file.size }, url }])
    }
    setUploading(false)
  }

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage.from('documents').remove([`${userId}/${fileName}`])
    if (error) {
      toast.error('Delete failed.')
    } else {
      toast.success('File deleted.')
      setFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="doc-root">
      <style>{`
        .doc-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: docFadeUp 0.5s ease-out;
        }

        @keyframes docFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header Banner */
        .doc-header {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .doc-header {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .doc-header-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .doc-header-glow {
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.08);
          filter: blur(80px);
          pointer-events: none;
        }

        .doc-header-content {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .doc-header-text {
          flex: 1;
          min-width: 0;
        }

        .doc-header-label {
          color: #9abfa8;
          font-size: 0.875rem;
          margin: 0 0 4px 0;
        }

        .doc-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .doc-header-title {
            font-size: 1.875rem;
          }
        }

        .doc-header-sub {
          color: #7a9a88;
          font-size: 0.75rem;
          margin: 8px 0 0 0;
        }

        .doc-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #c9a84c;
          color: #1a3a2a;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          border: none;
          box-shadow: 0 8px 24px -4px rgba(201, 168, 76, 0.3);
        }

        .doc-upload-btn:hover {
          background: #ffffff;
          transform: translateY(-1px);
        }

        .doc-upload-btn:active {
          transform: scale(0.98);
        }

        .doc-upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .doc-upload-btn svg {
          width: 15px;
          height: 15px;
        }

        /* Card */
        .doc-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .doc-card {
            border-radius: 1.25rem;
          }
        }

        /* Loading */
        .doc-loading {
          display: flex;
          justify-content: center;
          padding: 64px 0;
        }

        .doc-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: docSpin 0.8s linear infinite;
        }

        @keyframes docSpin {
          to { transform: rotate(360deg); }
        }

        /* Empty State */
        .doc-empty {
          padding: 64px 24px;
          text-align: center;
        }

        @media (min-width: 640px) {
          .doc-empty {
            padding: 80px 24px;
          }
        }

        .doc-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f7f4ef;
          border: 1px dashed #dcd2c1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .doc-empty-icon svg {
          width: 28px;
          height: 28px;
          color: #9a8f7a;
        }

        .doc-empty-title {
          font-size: 1rem;
          font-weight: 700;
          color: #5a5040;
          margin: 0 0 4px 0;
        }

        .doc-empty-desc {
          font-size: 0.875rem;
          color: #9a8f7a;
          margin: 0;
        }

        /* File List */
        .doc-list {
          display: flex;
          flex-direction: column;
        }

        .doc-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f7f4ef;
        }

        .doc-item:last-child {
          border-bottom: none;
        }

        .doc-item:hover {
          background: #faf8f4;
        }

        @media (min-width: 640px) {
          .doc-item {
            padding: 16px 24px;
            gap: 16px;
          }
        }

        .doc-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .doc-item-icon svg {
          width: 18px;
          height: 18px;
          color: #7a6a55;
        }

        .doc-item-info {
          flex: 1;
          min-width: 0;
        }

        .doc-item-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a3a2a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .doc-item-size {
          font-size: 0.75rem;
          color: #9a8f7a;
          font-weight: 500;
        }

        .doc-item-date {
          font-size: 0.75rem;
          color: #b0a490;
        }

        .doc-item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .doc-btn-view {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #5a5040;
          background: transparent;
          border: 1px solid #ddd5c8;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .doc-btn-view:hover {
          background: #f7f4ef;
          border-color: #c9a84c;
          color: #1a3a2a;
        }

        .doc-btn-view svg {
          width: 12px;
          height: 12px;
        }

        .doc-btn-delete {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .doc-btn-delete:hover {
          background: #fef2f2;
          color: #991b1b;
        }

        .doc-btn-delete:active {
          transform: scale(0.95);
        }

        .doc-btn-delete svg {
          width: 15px;
          height: 15px;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .doc-root {
            gap: 16px;
          }
          .doc-header {
            padding: 20px;
          }
          .doc-header-title {
            font-size: 1.25rem;
          }
          .doc-upload-btn {
            width: 100%;
            justify-content: center;
          }
          .doc-item {
            padding: 14px 16px;
          }
          .doc-item-actions {
            gap: 6px;
          }
          .doc-btn-view {
            padding: 6px 10px;
            font-size: 0.6875rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="doc-header">
        <div className="doc-header-pattern" />
        <div className="doc-header-glow" />
        <div className="doc-header-content">
          <div className="doc-header-text">
            <p className="doc-header-label">Resident Portal</p>
            <h1 className="doc-header-title">My Documents</h1>
            <p className="doc-header-sub">Manage your saved IDs and documents</p>
          </div>
          <label className="doc-upload-btn" style={{ pointerEvents: uploading ? 'none' : 'auto' }}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload size={15} />}
            {uploading ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Card */}
      <div className="doc-card">
        {loading ? (
          <div className="doc-loading">
            <div className="doc-spinner" />
          </div>
        ) : files.length === 0 ? (
          <div className="doc-empty">
            <div className="doc-empty-icon">
              <FolderOpen size={28} />
            </div>
            <p className="doc-empty-title">No documents yet</p>
            <p className="doc-empty-desc">Upload your IDs and documents to use in requests.</p>
          </div>
        ) : (
          <div className="doc-list">
            {files.map(file => (
              <div key={file.name} className="doc-item">
                <div className="doc-item-icon">
                  <File size={18} />
                </div>
                <div className="doc-item-info">
                  <p className="doc-item-name">{file.name}</p>
                  <div className="doc-item-meta">
                    <span className="doc-item-size">{formatSize(file.metadata?.size)}</span>
                    <span className="doc-item-date">{formatDate(file.created_at)}</span>
                  </div>
                </div>
                <div className="doc-item-actions">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-btn-view"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="doc-btn-delete"
                    aria-label="Delete file"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}