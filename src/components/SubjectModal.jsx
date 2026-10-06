import { useState } from 'react'
import { errMsg } from '../api'
import { subjectsApi } from '../services'
import { Button, Modal } from './ui'

export default function SubjectModal({ subject: s, onClose, onSaved }) {
  const [f, setF] = useState({ name: s?.name || '', description: s?.description || '', color: s?.color || '#3b5bdb' })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Subject name is required.')
    setBusy(true)
    try { s ? await subjectsApi.save(s.id, f) : await subjectsApi.create(f); onSaved(s ? 'Subject updated' : 'Subject created') }
    catch (x) { setErr(errMsg(x)); setBusy(false) }
  }
  return (
    <Modal title={s ? 'Edit subject' : 'Add subject'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {err && <div className="alert error" role="alert">{err}</div>}
        <label>Name<input value={f.name} maxLength={100} autoFocus onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Operating Systems" /></label>
        <label>Description<textarea rows="3" value={f.description} maxLength={500} onChange={e => setF({ ...f, description: e.target.value })} /></label>
        <label>Colour<input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} /></label>
        <div className="actions"><Button onClick={onClose}>Cancel</Button><Button variant="primary" type="submit" loading={busy}>{s ? 'Save changes' : 'Create subject'}</Button></div>
      </form>
    </Modal>
  )
}
