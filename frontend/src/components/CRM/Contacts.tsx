'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Contact } from '@/types'

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getContacts()
        setContacts(data)
        if (data.length) setActiveContact(data[0])
      } catch (e) {
        console.error('Failed to load contacts', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setNotes(activeContact?.notes || '')
  }, [activeContact])

  const saveNotes = async () => {
    if (!activeContact) return
    setSaving(true)
    try {
      const updated = await apiClient.updateContact(activeContact.id as number, { notes })
      setActiveContact(updated)
      setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
    } catch (e) {
      console.error('Failed to save notes', e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6">Loading contacts…</div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
      <aside className="col-span-4 bg-white border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Contacts</h2>
        </div>
        <div className="overflow-y-auto">
          {contacts.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveContact(c)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${(activeContact?.id === c.id) ? 'bg-gray-50' : ''}`}
            >
              <div className="font-medium">{c.name || 'Unknown'}</div>
              <div className="text-xs text-gray-500">{c.phone_number || c.facebook_id || c.email || '—'}</div>
              {c.tags?.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.tags.slice(0, 4).map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 rounded px-1.5 py-0.5">{String(t)}</span>
                  ))}
                  {c.tags.length > 4 ? <span className="text-[10px] text-gray-500">+{c.tags.length - 4}</span> : null}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </aside>

      <section className="col-span-8 bg-white border rounded-lg flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{activeContact?.name || 'Select a contact'}</div>
              {activeContact ? (
                <div className="text-xs text-gray-500">{activeContact.phone_number || activeContact.facebook_id || activeContact.email || '—'}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Private notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm min-h-[160px]"
              placeholder="Add notes about this customer…"
              disabled={!activeContact}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={saveNotes}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
                disabled={!activeContact || saving}
              >
                Save notes
              </button>
              <button
                onClick={() => setNotes(activeContact?.notes || '')}
                className="px-4 py-2 border rounded"
                disabled={!activeContact || saving}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


