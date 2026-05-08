import { createClient } from '@/lib/supabase/server'
import TodayWorkout from '@/components/client/TodayWorkout'
import BodyMap from '@/components/shared/BodyMap'
import MessageThread from '@/components/shared/MessageThread'

export default async function ClientTodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: relationship } = await supabase
    .from('coach_clients')
    .select('*, coach:users!coach_clients_coach_id_fkey(id, full_name)')
    .eq('client_id', user!.id)
    .eq('active', true)
    .single()

  const todayDow = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const { data: workoutDay } = relationship ? await supabase
    .from('workout_days')
    .select('*, exercises(*)')
    .eq('coach_client_id', relationship.id)
    .eq('week_number', relationship.program_week)
    .eq('day_of_week', todayDow)
    .single() : { data: null }

  const { data: completions } = workoutDay ? await supabase
    .from('exercise_completions')
    .select('exercise_id')
    .eq('client_id', user!.id)
    .in('exercise_id', (workoutDay.exercises ?? []).map((e: any) => e.id)) : { data: [] }

  const completedIds = new Set((completions ?? []).map((c: any) => c.exercise_id))

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium">Today</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            {workoutDay && !workoutDay.is_rest && ` · Week ${relationship?.program_week}`}
          </p>
        </div>
      </div>

      {!relationship ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-gray-400">No coach assigned yet. Ask your coach to add you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <TodayWorkout
              workoutDay={workoutDay}
              completedIds={completedIds}
              clientId={user!.id}
              coachNote={relationship.coach_note}
            />
            <MessageThread
              coachClientId={relationship.id}
              currentUserId={user!.id}
              otherName={relationship.coach?.full_name ?? 'Your coach'}
            />
          </div>
          <div className="flex flex-col gap-4">
            <BodyMap dayType={workoutDay?.day_type ?? 'rst'} isRest={workoutDay?.is_rest ?? true} />
            <div className="card p-4">
              <div className="text-xs font-medium text-gray-700 mb-3">Today's focus</div>
              {workoutDay && !workoutDay.is_rest ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-gray-500">
                    Intensity target: <span className="font-medium text-gray-800">{relationship.intensity_min}–{relationship.intensity_max}%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Week <span className="font-medium text-gray-800">{relationship.program_week}</span> of your program
                  </div>
                  {relationship.coach_note && (
                    <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-1 leading-relaxed">
                      {relationship.coach_note}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Rest day — recover well.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
