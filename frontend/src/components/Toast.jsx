import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import Icon from './Icon'

const Ctx = createContext({ success() {}, error() {}, info() {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const id = useRef(0)
  const dismiss = useCallback(i => setItems(a => a.filter(t => t.id !== i)), [])
  const push = useCallback((type, text) => {
    const n = ++id.current
    setItems(a => [...a.slice(-3), { id: n, type, text }])
    setTimeout(() => dismiss(n), type === 'error' ? 6000 : 3500)
  }, [dismiss])
  const api = useMemo(() => ({ success: t => push('success', t), error: t => push('error', t), info: t => push('info', t) }), [push])
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'alert' : 'info'} size={18} />
            <span>{t.text}</span>
            <button className="icon-btn" aria-label="Dismiss" onClick={() => dismiss(t.id)}><Icon name="x" size={16} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
