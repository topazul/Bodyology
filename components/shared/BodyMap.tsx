import { DayType } from '@/lib/types'
import { DAY_TYPES } from '@/lib/utils'

const muscleGroups: Record<DayType, { primary: string[]; secondary: string[] }> = {
  str: { primary: ['ql','qr','gl','gr','hl','hr'], secondary: ['cfl','cfr','hip','lb'] },
  hyp: { primary: ['cl','cr','ll','lr','sl','sr'], secondary: ['bl','br','ticl','ticr','tl','tr'] },
  cor: { primary: ['a1','a2','a3','a4','lb'],      secondary: ['sl','sr'] },
  aer: { primary: ['ql','qr','cfl','cfr'],         secondary: ['hl','hr','hip'] },
  mob: { primary: ['hip','lb','gl','gr'],          secondary: ['hl','hr'] },
  rec: { primary: [],                              secondary: [] },
  rst: { primary: [],                              secondary: [] },
}

interface Props { dayType: DayType; isRest: boolean }

export default function BodyMap({ dayType, isRest }: Props) {
  const groups = muscleGroups[dayType] ?? muscleGroups.rst
  const dayConfig = DAY_TYPES[dayType]

  function cls(id: string) {
    if (groups.primary.includes(id)) return 'fill-teal-400 opacity-100'
    if (groups.secondary.includes(id)) return 'fill-teal-100'
    return 'fill-gray-100'
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Muscles today</span>
        {!isRest && <span className={`tag ${dayConfig.color} text-[10px]`}>{dayConfig.label}</span>}
      </div>
      <div className="flex justify-center gap-0 py-3">
        <svg width="100" height="240" viewBox="0 0 100 165" aria-label="Front body muscle map">
          <ellipse cx="50" cy="10" rx="9" ry="10" className="fill-gray-50 stroke-gray-200" strokeWidth="0.5"/>
          <rect x="35" y="21" width="30" height="28" rx="4" className="fill-gray-50 stroke-gray-200" strokeWidth="0.5"/>
          <rect x="20" y="22" width="12" height="26" rx="5" className={cls('sl')}/>
          <rect x="68" y="22" width="12" height="26" rx="5" className={cls('sr')}/>
          <rect x="10" y="25" width="9" height="22" rx="4" className={cls('bl')}/>
          <rect x="81" y="25" width="9" height="22" rx="4" className={cls('br')}/>
          <rect x="37" y="22" width="10" height="14" rx="2" className={cls('cl')}/>
          <rect x="53" y="22" width="10" height="14" rx="2" className={cls('cr')}/>
          <rect x="38" y="37" width="9" height="5" rx="2" className={cls('a1')}/>
          <rect x="53" y="37" width="9" height="5" rx="2" className={cls('a2')}/>
          <rect x="38" y="43" width="9" height="4" rx="2" className={cls('a3')}/>
          <rect x="53" y="43" width="9" height="4" rx="2" className={cls('a4')}/>
          <rect x="35" y="57" width="30" height="10" rx="3" className={cls('hip')}/>
          <rect x="35" y="57" width="15" height="32" rx="5" className={cls('ql')}/>
          <rect x="52" y="57" width="15" height="32" rx="5" className={cls('qr')}/>
          <rect x="35" y="108" width="11" height="20" rx="4" className={cls('cfl')}/>
          <rect x="54" y="108" width="11" height="20" rx="4" className={cls('cfr')}/>
          <text x="50" y="158" textAnchor="middle" fontSize="5" className="fill-gray-300">Front</text>
        </svg>
        <svg width="100" height="240" viewBox="0 0 100 165" aria-label="Back body muscle map">
          <ellipse cx="50" cy="10" rx="9" ry="10" className="fill-gray-50 stroke-gray-200" strokeWidth="0.5"/>
          <rect x="35" y="21" width="30" height="28" rx="4" className="fill-gray-50 stroke-gray-200" strokeWidth="0.5"/>
          <rect x="20" y="22" width="12" height="26" rx="5" className={cls('tl')}/>
          <rect x="68" y="22" width="12" height="26" rx="5" className={cls('tr')}/>
          <rect x="10" y="25" width="9" height="22" rx="4" className={cls('ticl')}/>
          <rect x="81" y="25" width="9" height="22" rx="4" className={cls('ticr')}/>
          <rect x="37" y="22" width="10" height="20" rx="2" className={cls('ll')}/>
          <rect x="53" y="22" width="10" height="20" rx="2" className={cls('lr')}/>
          <rect x="37" y="38" width="26" height="20" rx="3" className={cls('lb')}/>
          <rect x="33" y="57" width="15" height="32" rx="5" className={cls('gl')}/>
          <rect x="52" y="57" width="15" height="32" rx="5" className={cls('gr')}/>
          <rect x="33" y="90" width="14" height="26" rx="5" className={cls('hl')}/>
          <rect x="53" y="90" width="14" height="26" rx="5" className={cls('hr')}/>
          <text x="50" y="158" textAnchor="middle" fontSize="5" className="fill-gray-300">Back</text>
        </svg>
      </div>
      <div className="flex justify-center gap-4 pb-3">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <div className="w-2 h-2 rounded-sm bg-teal-400" /> Primary
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <div className="w-2 h-2 rounded-sm bg-teal-100" /> Secondary
        </div>
      </div>
    </div>
  )
}
