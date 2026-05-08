'use client'
import { useState } from 'react'
import { Trophy, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialExercise: string
  clientId: string
  onClose: () => void
}

export default function PRModal({ initialExercise, clientId, onClose }: Props) {
  const [exercise, setExercise] = useState(initialExercise)
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!exercise || !weight) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('personal_records').insert({
      client_id: clientId,
      exercise_name: exercise,
      weight: parseFloat(weight),
      unit,
      notes: notes || null,
    })
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl border border-gray-100 w-full max-w-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-amber-500" aria-hidden="true" />
            <span className="text-sm font-medium">Log personal record</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div>
            <label className="label">Exercise</label>
            <input className="input" type="text" placeholder="e.g. Back squat" value={exercise} onChange={e => setExercise(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Weight</label>
              <input className="input" type="number" placeholder="142" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={unit} onChange={e => setUnit(e.target.value as 'kg' | 'lbs')}>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes <span className="text-gray-300">(optional)</span></label>
            <input className="input" type="text" placeholder="e.g. paused, belt, competition" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="px-4 pb-4 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={save}
            disabled={saving || !exercise || !weight}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save PR'}
          </button>
        </div>
      </div>
    </div>
  )
}
