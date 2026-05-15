'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAdmin } from '../../../../hooks/useAdmin'
import { useModeration } from '../../../../hooks/useModeration'
import { useAuthContext } from '../../../context/AuthContext'
import { RoleBadge } from '../../../components/RoleBadge'
import { UserRole, ROLE_HIERARCHY } from '@amalia/shared'

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const t = useTranslations('Admin')
  const { userRole: myRole } = useAuthContext()
  const { userDetail, isLoading, loadUserDetail, assignRole, removeRole, loadAllPermissions, permissions, grantPermission, revokePermission } = useAdmin()
  const { banUser, unbanUser, muteUser, unmuteUser } = useModeration()

  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState<string>('')
  const [showBanForm, setShowBanForm] = useState(false)

  useEffect(() => {
    loadUserDetail(userId)
    loadAllPermissions()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !userDetail) {
    return <div className="text-gray-500">{t('loading')}</div>
  }

  const myLevel = ROLE_HIERARCHY[myRole] ?? 0
  const targetLevel = ROLE_HIERARCHY[userDetail.role] ?? 0
  const canManage = myLevel > targetLevel

  const isBanned = userDetail.bannedUntil && new Date(userDetail.bannedUntil) > new Date()

  const handleBan = async () => {
    if (!banReason.trim()) return
    await banUser(userId, {
      reason: banReason,
      durationHours: banDuration ? parseInt(banDuration) : null,
      banChat: true,
      banChallenge: true,
      banDuel: true,
    })
    setShowBanForm(false)
    setBanReason('')
    setBanDuration('')
    loadUserDetail(userId)
  }

  const handleUnban = async () => {
    await unbanUser(userId)
    loadUserDetail(userId)
  }

  const handleMute = async () => {
    await muteUser(userId, { muteGlobal: true, durationHours: 24 })
    loadUserDetail(userId)
  }

  const handleUnmute = async () => {
    await unmuteUser(userId)
    loadUserDetail(userId)
  }

  const handleRoleChange = async (role: string) => {
    if (role === 'user') {
      await removeRole(userId)
    } else {
      await assignRole(userId, role as UserRole)
    }
    loadUserDetail(userId)
  }

  const handleTogglePermission = async (permKey: string, hasIt: boolean) => {
    if (hasIt) {
      await revokePermission(userId, permKey)
    } else {
      await grantPermission(userId, permKey as any)
    }
    loadUserDetail(userId)
  }

  const userPermKeys = new Set(userDetail.permissions.map(p => p.permission.key))

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        &larr; {t('back')}
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {userDetail.profilePhotoUrl ? (
            <img src={userDetail.profilePhotoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-500">
              {userDetail.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {userDetail.username}
              <RoleBadge role={userDetail.role} size="md" />
            </h1>
            <p className="text-sm text-gray-500">{userDetail.email ?? t('noEmail')}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 mb-4">
          {isBanned && (
            <span className="text-xs bg-red-100 text-red-700 rounded-full px-3 py-1">
              {t('banned')} — {userDetail.banReason}
            </span>
          )}
          {userDetail.isMuted && (
            <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-3 py-1">{t('muted')}</span>
          )}
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {isBanned ? (
              <button onClick={handleUnban} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                {t('unban')}
              </button>
            ) : (
              <button onClick={() => setShowBanForm(!showBanForm)} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                {t('ban')}
              </button>
            )}

            {userDetail.isMuted ? (
              <button onClick={handleUnmute} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                {t('unmute')}
              </button>
            ) : (
              <button onClick={handleMute} className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600">
                {t('mute')}
              </button>
            )}
          </div>
        )}

        {showBanForm && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <input
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              placeholder={t('banReasonPlaceholder')}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
            />
            <div className="flex gap-2 items-center">
              <input
                value={banDuration}
                onChange={e => setBanDuration(e.target.value)}
                placeholder={t('banDurationPlaceholder')}
                type="number"
                className="w-32 border rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-xs text-gray-500">{t('hoursOrEmpty')}</span>
              <button onClick={handleBan} className="ml-auto px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                {t('confirmBan')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role management */}
      {canManage && myLevel >= 2 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="font-semibold mb-3">{t('roleManagement')}</h2>
          <div className="flex gap-2">
            {(['user', 'moderator', 'admin'] as const)
              .filter(r => ROLE_HIERARCHY[r] < myLevel)
              .map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    userDetail.role === role
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      {canManage && myLevel >= 3 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold mb-3">{t('permissions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissions.map(p => {
              const hasIt = userPermKeys.has(p.key)
              return (
                <label key={p.key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasIt}
                    onChange={() => handleTogglePermission(p.key, hasIt)}
                    className="rounded"
                  />
                  <div>
                    <span className="text-sm font-medium">{p.key}</span>
                    <span className="text-xs text-gray-500 ml-2">{p.description}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
