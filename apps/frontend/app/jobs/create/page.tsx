'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMyOffers } from '../../../hooks/useJobs'
import { useAuthContext } from '../../context/AuthContext'
import { ContractType, WorkMode, CreateJobOfferRequest, JobHardSkillReq } from '@amalia/shared'
import { Footer } from '../../components/Footer'

const contractOptions: { value: ContractType; label: string }[] = [
  { value: ContractType.Permanent, label: 'contractPermanent' },
  { value: ContractType.FixedTerm, label: 'contractFixedTerm' },
  { value: ContractType.Freelance, label: 'contractFreelance' },
  { value: ContractType.Internship, label: 'contractInternship' },
]

const workModeOptions: { value: WorkMode; label: string }[] = [
  { value: WorkMode.Remote, label: 'modeRemote' },
  { value: WorkMode.Hybrid, label: 'modeHybrid' },
  { value: WorkMode.Onsite, label: 'modeOnsite' },
]

const levelOptions = ['junior', 'mid', 'senior', 'lead']

export default function CreateOfferPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const { createOffer } = useMyOffers()
  const t = useTranslations('Jobs')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sector, setSector] = useState('')
  const [contractType, setContractType] = useState<ContractType>(ContractType.Permanent)
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.Remote)
  const [location, setLocation] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [yearsRequired, setYearsRequired] = useState('0')
  const [expiresInDays, setExpiresInDays] = useState('30')

  // Hard skills
  const [skills, setSkills] = useState<JobHardSkillReq[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [newLevel, setNewLevel] = useState('mid')

  // Soft skills
  const [softSkills, setSoftSkills] = useState<string[]>([])
  const [newSoft, setNewSoft] = useState('')

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isAuthenticated) return null

  const addSkill = () => {
    const name = newSkill.trim().toLowerCase()
    if (!name || skills.some(s => s.name === name)) return
    setSkills(prev => [...prev, { name, minLevel: newLevel }])
    setNewSkill('')
  }

  const removeSkill = (name: string) => setSkills(prev => prev.filter(s => s.name !== name))

  const addSoftSkill = () => {
    const s = newSoft.trim()
    if (!s || softSkills.includes(s)) return
    setSoftSkills(prev => [...prev, s])
    setNewSoft('')
  }

  const removeSoftSkill = (s: string) => setSoftSkills(prev => prev.filter(x => x !== s))

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) return setError(t('validationTitle'))
    if (!description.trim()) return setError(t('validationDescription'))
    if (!sector.trim()) return setError(t('validationSector'))

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Math.max(1, parseInt(expiresInDays) || 30))

    const data: CreateJobOfferRequest = {
      title: title.trim(),
      description: description.trim(),
      sector: sector.trim(),
      contractType,
      workMode,
      location: location.trim() || undefined,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      yearsRequired: parseInt(yearsRequired) || 0,
      hardSkills: skills,
      softSkills,
      expiresAt: expiresAt.toISOString(),
    }

    setSubmitting(true)
    try {
      const offer = await createOffer(data)
      router.push(`/jobs/${offer.id}`)
    } catch {
      setError(t('publishError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0" />

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Back */}
        <button onClick={() => router.push('/jobs')} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 mb-4 inline-block transition-colors">
          {t('backToJobs')}
        </button>

        <h1 className="text-lg font-semibold text-zinc-100 font-mono mb-6">{t('createTitle')}</h1>

        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldTitle')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('fieldTitlePlaceholder')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldDescription')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              placeholder={t('fieldDescriptionPlaceholder')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 resize-none" />
          </div>

          {/* Sector */}
          <div>
            <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldSector')}</label>
            <input value={sector} onChange={e => setSector(e.target.value)} placeholder={t('fieldSectorPlaceholder')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
          </div>

          {/* Contract + Work mode row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldContractType')}</label>
              <div className="flex flex-wrap gap-1.5">
                {contractOptions.map(o => (
                  <button key={o.value} onClick={() => setContractType(o.value)}
                    className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-colors ${
                      contractType === o.value
                        ? 'bg-cyan-400/15 border-cyan-400/50 text-cyan-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}>
                    {t(o.label)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldWorkMode')}</label>
              <div className="flex flex-wrap gap-1.5">
                {workModeOptions.map(o => (
                  <button key={o.value} onClick={() => setWorkMode(o.value)}
                    className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-colors ${
                      workMode === o.value
                        ? 'bg-violet-400/15 border-violet-400/50 text-violet-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}>
                    {t(o.label)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldLocation')}</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder={t('fieldLocationPlaceholder')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
          </div>

          {/* Salary range */}
          <div>
            <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldSalary')}</label>
            <div className="grid grid-cols-2 gap-3">
              <input value={salaryMin} onChange={e => setSalaryMin(e.target.value.replace(/\D/g, ''))} placeholder={t('fieldSalaryMin')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
              <input value={salaryMax} onChange={e => setSalaryMax(e.target.value.replace(/\D/g, ''))} placeholder={t('fieldSalaryMax')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
            </div>
          </div>

          {/* Years + Expires */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldYearsExp')}</label>
              <input value={yearsRequired} onChange={e => setYearsRequired(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono mb-1.5 block">{t('fieldExpiresDays')}</label>
              <input value={expiresInDays} onChange={e => setExpiresInDays(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
            </div>
          </div>

          {/* Hard skills */}
          <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/30">
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-3 block">{t('fieldHardSkills')}</label>
            <div className="flex gap-2 mb-3">
              <input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder={t('fieldHardSkillsPlaceholder')}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50" />
              <select value={newLevel} onChange={e => setNewLevel(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/50">
                {levelOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={addSkill} className="text-xs font-mono px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">+</button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s.name} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 flex items-center gap-1.5">
                    {s.name} <span className="text-cyan-400/50">({s.minLevel})</span>
                    <button onClick={() => removeSkill(s.name)} className="text-cyan-400/50 hover:text-red-400 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Soft skills */}
          <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/30">
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-3 block">{t('fieldSoftSkills')}</label>
            <div className="flex gap-2 mb-3">
              <input value={newSoft} onChange={e => setNewSoft(e.target.value)} placeholder={t('fieldSoftSkillsPlaceholder')}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50" />
              <button onClick={addSoftSkill} className="text-xs font-mono px-3 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors">+</button>
            </div>
            {softSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {softSkills.map(s => (
                  <span key={s} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-400 flex items-center gap-1.5">
                    {s}
                    <button onClick={() => removeSoftSkill(s)} className="text-violet-400/50 hover:text-red-400 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs font-mono p-3 rounded-lg border text-red-400 bg-red-400/5 border-red-400/20">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => router.push('/jobs')}
              className="px-4 py-2.5 rounded-lg text-sm font-mono border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors">
              {t('cancelCreate')}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {submitting ? t('publishing') : t('publishOffer')}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
