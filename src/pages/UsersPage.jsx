import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ROLES } from '../auth/permissions'

const allRoles = Object.values(ROLES)
const emptyCreate = { username: '', fullName: '', email: '', password: '', role: ROLES.CLUB_MEMBER }

export default function UsersPage() {
  const { user, hasRole } = useAuth()
  const { success, error } = useToast()
  const isAdmin = hasRole(ROLES.ADMIN)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const availableRoles = isAdmin ? allRoles : allRoles.filter(role => role !== ROLES.ADMIN)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getUsers()
      setUsers(Array.isArray(result) ? result : [])
    } catch (err) {
      error(err.message || 'Không thể tải danh sách người dùng.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return users
    return users.filter(item =>
      item.username.toLowerCase().includes(query)
      || item.fullName.toLowerCase().includes(query)
      || item.email.toLowerCase().includes(query)
      || item.roles.some(role => role.toLowerCase().includes(query)),
    )
  }, [searchQuery, users])

  const createUser = async (event) => {
    event.preventDefault()
    if (busyId) return
    setBusyId('create')
    try {
      const created = await api.createUser({
        username: createForm.username.trim(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        roles: [createForm.role],
      })
      setUsers(current => [...current, created].sort((a, b) => a.fullName.localeCompare(b.fullName)))
      setShowCreate(false)
      setCreateForm(emptyCreate)
      success('Đã tạo tài khoản.')
    } catch (err) {
      error(err.message || 'Không thể tạo tài khoản.')
    } finally {
      setBusyId(null)
    }
  }

  const openEdit = (target) => {
    setEditing(target)
    setEditForm({
      fullName: target.fullName,
      email: target.email,
      isActive: target.isActive,
      role: target.roles[0],
    })
  }

  const updateUser = async (event) => {
    event.preventDefault()
    if (!editing || busyId) return
    setBusyId(editing.id)
    try {
      const updated = await api.updateUser(editing.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        isActive: editForm.isActive,
        roles: [editForm.role],
      })
      setUsers(current => current.map(item => item.id === updated.id ? updated : item))
      setEditing(null)
      success('Đã cập nhật tài khoản.')
    } catch (err) {
      error(err.message || 'Không thể cập nhật tài khoản.')
    } finally {
      setBusyId(null)
    }
  }

  const toggleLock = async (target) => {
    if (busyId) return
    setBusyId(target.id)
    try {
      if (target.isLocked) await api.unlockUser(target.id)
      else await api.lockUser(target.id)
      setUsers(current => current.map(item => item.id === target.id ? { ...item, isLocked: !target.isLocked } : item))
      success(target.isLocked ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.')
    } catch (err) {
      error(err.message || 'Không thể thay đổi trạng thái khóa.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý người dùng</h2>
          <p className="mt-1 text-sm text-gray-400">Mỗi tài khoản chỉ có đúng một actor role.</p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white">Tạo tài khoản</button>
      </div>

      <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Tìm tên, email, username hoặc vai trò..." className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500" />

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-[840px] w-full">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-left text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-4">Người dùng</th><th className="px-5 py-4">Vai trò</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map(target => {
                  const protectedAdmin = target.roles.includes(ROLES.ADMIN) && !isAdmin
                  return (
                    <tr key={target.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4"><p className="font-semibold text-white">{target.fullName}</p><p className="mt-1 text-xs text-gray-500">{target.username} · {target.email}</p></td>
                      <td className="px-5 py-4"><span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">{target.roles[0]}</span></td>
                      <td className="px-5 py-4"><span className={`text-sm font-semibold ${target.isLocked || !target.isActive ? 'text-rose-300' : 'text-emerald-300'}`}>{target.isLocked ? 'Đã khóa' : target.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}</span></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(target)} disabled={protectedAdmin} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-gray-300 disabled:opacity-35">Sửa</button><button type="button" onClick={() => toggleLock(target)} disabled={target.id === user?.id || protectedAdmin || busyId === target.id} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-35 ${target.isLocked ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{target.isLocked ? 'Mở khóa' : 'Khóa'}</button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo tài khoản">
        <form onSubmit={createUser} className="space-y-4">
          <input value={createForm.username} onChange={event => setCreateForm(current => ({ ...current, username: event.target.value }))} required maxLength={100} placeholder="Username" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <input value={createForm.fullName} onChange={event => setCreateForm(current => ({ ...current, fullName: event.target.value }))} required maxLength={200} placeholder="Họ và tên" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <input type="email" value={createForm.email} onChange={event => setCreateForm(current => ({ ...current, email: event.target.value }))} required placeholder="Email" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <input type="password" value={createForm.password} onChange={event => setCreateForm(current => ({ ...current, password: event.target.value }))} required minLength={8} placeholder="Mật khẩu ban đầu" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <select value={createForm.role} onChange={event => setCreateForm(current => ({ ...current, role: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900">{availableRoles.map(role => <option key={role} value={role}>{role}</option>)}</select>
          <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Tạo</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Cập nhật tài khoản">
        {editForm && (
          <form onSubmit={updateUser} className="space-y-4">
            <input value={editForm.fullName} onChange={event => setEditForm(current => ({ ...current, fullName: event.target.value }))} required maxLength={200} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            <input type="email" value={editForm.email} onChange={event => setEditForm(current => ({ ...current, email: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            <select value={editForm.role} onChange={event => setEditForm(current => ({ ...current, role: event.target.value }))} disabled={editing?.id === user?.id} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900 disabled:bg-neutral-100">{availableRoles.map(role => <option key={role} value={role}>{role}</option>)}</select>
            <label className="flex items-center gap-3 text-sm font-semibold text-neutral-700"><input type="checkbox" checked={editForm.isActive} onChange={event => setEditForm(current => ({ ...current, isActive: event.target.checked }))} disabled={editing?.id === user?.id} className="h-4 w-4" />Tài khoản đang hoạt động</label>
            <div className="flex gap-3"><button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === editing?.id} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Lưu</button></div>
          </form>
        )}
      </Modal>
    </div>
  )
}
