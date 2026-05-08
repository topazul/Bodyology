'use client'
import { useState } from 'react'
import { CheckCircle, Circle, Play, Trophy, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DAY_TYPES, intensityColor, intensityBarColor } from '@/lib/utils'
import type { WorkoutDay, Exercise } from '@/lib/types'
import PRModal from '@/components/shared/PRModal'

interface Props {
  workoutDay: (WorkoutDay & { exercises: Exercise[] }) | null
  completedIds: Set<string>
  clientId: string
  coachNote?: string
}

export default function TodayWorkout({ workoutDay, completedIds, clientId, coachNote }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(completedIds)
  const [prExercise, setPrExercise] = useState<string | null>(null)

  const exercises = workoutDay?.exercises?.sort((a, b) => a.order_index - b.order_index) ?? []
  const doneCount = exercises.filter(e => completed.has(e.id)).length
  const progress = exercises.length > 0 ? Math.round(doneCount / exercises.length * 100) : 0

  async function toggleComplete(exercise: Exercise) {
    const supabase = createClient()
    const isDone = completed.has(exercise.id)
    const next = new Set(completed)
    if (isDone) {
      await supabase.from('exercise_completions')
        .delete()
        .eq('exercise_id', exercise.id)
        .eq('client_id', clientId)
      next.delete(exercise.id)
    } else {
      await supabase.from('exercise_completions')
        .insert({ exercise_id: exercise.id, client_id: clientId })
      next.add(exercise.id)
    }
    setCompleted(next)
  }

  if (!workoutDay || workoutDay.is_rest) {
    return (
      <div className="card p-10 text-center">
        <Moon size={28} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-500">Rest day</p>
        <p className="text-xs text-gray-300 mt-1">No exercises scheduled — recover well.</p>
      </div>
    )
  }

  const dayConfig = DAY_TYPES[workoutDay.day_type]

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="card-title">Today's session</span>
            <span className={`tag ${dayConfig.color}`}>{dayConfig.label}</span>
          </div>
          <button className="btn-primary text-xs" onClick={() => setPrExercise('')}>
            <Trophy size={11} aria-hidden="true" /> Log PR
          </button>
        </div>

        <div>
          {exercises.map(ex => {
            const isDone = completed.has(ex.id)
            return (
              <div
                key={ex.id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isDone ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => toggleComplete(ex)}
                  className="flex-shrink-0 text-gray-300 hover:text-teal-500 transition-colors"
                  aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isDone
                    ? <CheckCircle size={18} className="text-teal-500" />
                    : <Circle size={18} />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>{ex.name}</div>
                  {ex.coach_note && <div className="text-xs text-gray-400 mt-0.5">{ex.coach_note}</div>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="tag bg-gray-50 text-gray-600 border-gray-100">{ex.sets}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`pct-pill ${intensityColor(ex.intensity_pct)}`}>{ex.intensity_pct}%</span>
                    <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${intensityBarColor(ex.intensity_pct)}`} style={{ width: `${ex.intensity_pct}%` }} />
                    </div>
                  </div>
                  {ex.video_url && (
                    <a href={ex.video_url} target="_blank" rel="noopener noreferrer"
                      className="w-6 h-5 rounded border border-teal-100 bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors"
                      aria-label="Watch demo">
                      <Play size={9} className="text-teal-600" aria-hidden="true" />
                    </a>
                  )}
                  <button onClick={() => setPrExercise(ex.name)} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100 transition-colors font-medium">
                    PR
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{doneCount} of {exercises.length} done</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
        </div>
      </div>

      {prExercise !== null && (
        <PRModal
          initialExercise={prExercise}
          clientId={clientId}
          onClose={() => setPrExercise(null)}
        />
      )}
    </>
  )
}
