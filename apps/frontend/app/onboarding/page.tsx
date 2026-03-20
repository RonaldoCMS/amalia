'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useOnboarding } from '../../hooks/useOnboarding'
import { DevLanguage, JobType, WorkStyle, DevGoal, Availability, EXPERIENCE_LEVELS, OnboardingRequest } from '@amalia/shared'

// ── Multi-select pill ──────────────────────────────────────────────────
function Pill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
        selected
          ? 'bg-cyan-400/15 border-cyan-400/50 text-cyan-400'
          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item]
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-0.5 flex-1 rounded-full transition-colors ${
            i < current ? 'bg-cyan-400' : i === current ? 'bg-cyan-400/60' : 'bg-zinc-800'
          }`}
        />
      ))}
    </div>
  )
}

const ALL_STEPS = 4

function OnboardingForm() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const { data: existing, save, isSaving, error } = useOnboarding()
  const t = useTranslations('Onboarding')

  const [step, setStep] = useState(0)
  const [languages, setLanguages] = useState<string[]>([])
  const [experience, setExperience] = useState<string>('')
  const [jobType, setJobType] = useState<string>('')
  const [goals, setGoals] = useState<string[]>([])
  const [workStyle, setWorkStyle] = useState<string>('')
  const [availability, setAvailability] = useState<string>('')
  const [bio, setBio] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  // Pre-fill when editing
  useEffect(() => {
    if (!isEdit || !existing) return
    if (existing.languages?.length) setLanguages(existing.languages)
    if (existing.yearsOfExperience) setExperience(existing.yearsOfExperience)
    if (existing.jobType) setJobType(existing.jobType)
    if (existing.goals?.length) setGoals(existing.goals)
    if (existing.workStyle) setWorkStyle(existing.workStyle)
    if (existing.availability) setAvailability(existing.availability)
    if (existing.bio) setBio(existing.bio)
    if (existing.githubUrl) setGithubUrl(existing.githubUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, isEdit])

  if (!isAuthenticated) return null

  const canProceed = (): boolean => {
    if (step === 0) return languages.length > 0
    if (step === 1) return !!experience && !!jobType
    if (step === 2) return goals.length > 0
    if (step === 3) return !!workStyle && !!availability
    return true
  }

  const handleFinish = async () => {
    await save({
      languages,
      yearsOfExperience: experience as OnboardingRequest['yearsOfExperience'],
      jobType: jobType as JobType,
      goals,
      workStyle: workStyle as WorkStyle,
      availability: availability as Availability,
      bio: bio || undefined,
      githubUrl: githubUrl || undefined,
    })
    router.replace(isEdit ? '/profile' : '/challenge')
  }

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-4 relative">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6">
          <span className="font-mono text-lg font-semibold tracking-tight">
            amalia<span className="text-cyan-400">_</span>
          </span>
        </div>

        <h1 className="text-xl font-semibold text-zinc-100 mb-1">
          {isEdit ? t('editTitle') : t('createTitle')}
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          {isEdit ? t('editSubtitle') : t('createSubtitle')}
        </p>

        <StepIndicator current={step} total={ALL_STEPS} />

        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-6 min-h-[340px] flex flex-col">

          {/* Step 0 — Languages */}
          {step === 0 && (
            <div className="flex flex-col gap-4 flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{t('sectionLanguages')}</p>
              <h2 className="text-base font-semibold text-zinc-100">{t('languagesQuestion')}</h2>
              <div className="flex flex-wrap gap-2">
                {Object.values(DevLanguage).map(l => (
                  <Pill
                    key={l} label={l} selected={languages.includes(l)}
                    onClick={() => setLanguages(toggle(languages, l))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Experience + Role */}
          {step === 1 && (
            <div className="flex flex-col gap-5 flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{t('sectionExperience')}</p>
              <div>
                <h2 className="text-base font-semibold text-zinc-100 mb-3">{t('yearsLabel')}</h2>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <Pill key={l} label={l === '0' ? t('years_zero') : t('years_other', { value: l })} selected={experience === l}
                      onClick={() => setExperience(l)} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100 mb-3">{t('roleLabel')}</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.values(JobType).map(j => (
                    <Pill key={j} label={j} selected={jobType === j} onClick={() => setJobType(j)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Goals */}
          {step === 2 && (
            <div className="flex flex-col gap-4 flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{t('sectionGoals')}</p>
              <h2 className="text-base font-semibold text-zinc-100">{t('goalsQuestion')}</h2>
              <div className="flex flex-wrap gap-2">
                {Object.values(DevGoal).map(g => (
                  <Pill key={g} label={t(`goal${g}`)} selected={goals.includes(g)}
                    onClick={() => setGoals(toggle(goals, g))} />
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Work style + Bio */}
          {step === 3 && (
            <div className="flex flex-col gap-5 flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{t('sectionWorkStyle')}</p>
              <div>
                <h2 className="text-base font-semibold text-zinc-100 mb-3">{t('workStyleLabel')}</h2>
                <div className="flex gap-2">
                  {Object.values(WorkStyle).map(w => (
                    <Pill key={w} label={w} selected={workStyle === w} onClick={() => setWorkStyle(w)} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100 mb-3">{t('availabilityLabel')}</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Availability).map(a => (
                    <Pill key={a} label={t(`avail${a}`)} selected={availability === a}
                      onClick={() => setAvailability(a)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('bioLabel')}</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  placeholder={t('bioPlaceholder')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('githubLabel')}</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 font-mono mt-3">✗ {error}</p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-sm font-mono border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              >
                {t('back')}
              </button>
            )}
            <button
              onClick={step < ALL_STEPS - 1 ? () => setStep(s => s + 1) : handleFinish}
              disabled={!canProceed() || isSaving}
              className="flex-1 py-2 rounded-lg text-sm font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? t('saving') : step < ALL_STEPS - 1 ? t('continue') : t('start')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const goalLabel: Record<string, string> = {
  Learn: '📚 Imparare',
  Network: '🤝 Fare network',
  Collaborate: '🛠 Collaborare',
  Mentor: '🎓 Fare da mentor',
  GetMentored: '🙋 Trovare un mentor',
  FindJob: '💼 Trovare lavoro',
  Freelance: '💻 Freelance',
  OpenSource: '🌐 Open source',
  StartupIdea: '🚀 Startup idea',
}

const availLabel: Record<string, string> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  FreelanceOnly: 'Solo freelance',
  OpenSource: 'Solo open source',
  NotAvailable: 'Non disponibile',
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  )
}
