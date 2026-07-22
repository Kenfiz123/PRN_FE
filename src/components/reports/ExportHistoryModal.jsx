import { useEffect, useState } from 'react'
import { Download, FileDown, RefreshCw } from 'lucide-react'
import Modal from '../Modal.jsx'
import { api } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function ExportHistoryModal({ isOpen, onClose }) {
  const { error, success } = useToast()
  const [exports, setExports] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const loadExports = async () => {
    setIsLoading(true)
    try {
      const data = await api.getExports({ page: 1, pageSize: 20 })
      setExports(data.items || [])
    } catch (err) {
      error(err.message || 'Unable to load export history.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) loadExports()
  }, [isOpen])

  const handleDownload = async (id, fileName) => {
    try {
      await api.downloadExport(id, fileName)
      success('Your file is downloading...')
    } catch (err) {
      error(err.message || 'Unable to download the file.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Export History">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={loadExports}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {isLoading && exports.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center"><div className="cyber-spinner" /></div>
        ) : exports.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-12 text-center text-slate-500">
            <FileDown size={32} className="mb-3 text-slate-600" />
            <p>No export requests yet.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex flex-col space-y-3">
              {exports.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition hover:bg-slate-800/50">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">Export #{item.id} - {item.exportType}</span>
                    <span className="mt-1 text-xs text-slate-400">Scope: {item.scope} | Created: {new Date(item.createdAtUtc).toLocaleString('en-US')}</span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-400' :
                        item.status === 'Failed' ? 'bg-rose-400/10 text-rose-400' :
                        'bg-amber-400/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                      {item.errorMessage && <span className="max-w-[200px] truncate text-xs text-rose-400" title={item.errorMessage}>{item.errorMessage}</span>}
                    </div>
                  </div>

                  {item.status === 'Completed' && item.file?.isAvailable && (
                    <button type="button" onClick={() => handleDownload(item.id, item.file.fileName)} className="inline-flex h-9 items-center justify-center rounded-lg bg-cyan-500/10 px-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20">
                      <Download size={16} className="mr-2" />
                      Download
                    </button>
                  )}
                  {item.status === 'Completed' && item.file && !item.file.isAvailable && <span className="text-xs italic text-slate-500">File expired</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
