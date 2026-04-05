import { useState } from 'react'
import { Lock, Bell, Globe, Eye, EyeOff, Shield, Sun, Moon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()

  // Password change
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifs: true,
    pushNotifs: true,
    assessmentReminders: true,
    progressUpdates: true,
    gamificationUpdates: true,
  })

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: t('error'), description: t('passwords_no_match'), variant: 'destructive' })
      return
    }
    if (passwords.newPassword.length < 8) {
      toast({ title: t('error'), description: t('password_min_8'), variant: 'destructive' })
      return
    }

    setIsChangingPassword(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      toast({ title: t('password_updated'), description: t('password_updated_desc') })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      const msg = err.response?.data?.message || t('password_error')
      toast({ title: t('error'), description: msg, variant: 'destructive' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('settings_page')}</h1>
        <p className="text-muted-foreground">{t('customize_experience')}</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {t('appearance')}
          </CardTitle>
          <CardDescription>{t('customize_visual')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('dark_mode')}</p>
              <p className="text-sm text-muted-foreground">{t('switch_theme')}</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary bg-muted' : 'border-border'
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-5 w-5" />
                <span className="font-medium">{t('light')}</span>
              </div>
              <div className="h-16 bg-white rounded border"></div>
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary bg-muted' : 'border-border'
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-5 w-5" />
                <span className="font-medium">{t('dark')}</span>
              </div>
              <div className="h-16 bg-gray-900 rounded border"></div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('security')}
          </CardTitle>
          <CardDescription>{t('change_password_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('current_password')}</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder={t('enter_current_password')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('new_password')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder={t('min_8_chars')}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirm_new_password')}</Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              placeholder={t('repeat_password')}
            />
          </div>
          {passwords.newPassword && passwords.newPassword.length < 8 && (
            <p className="text-sm text-destructive">{t('password_min_8')}</p>
          )}
          {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
            <p className="text-sm text-destructive">{t('passwords_no_match')}</p>
          )}
          <Button
            onClick={handleChangePassword}
            disabled={
              isChangingPassword ||
              !passwords.currentPassword ||
              !passwords.newPassword ||
              passwords.newPassword !== passwords.confirmPassword ||
              passwords.newPassword.length < 8
            }
          >
            <Lock className="mr-2 h-4 w-4" />
            {isChangingPassword ? t('changing') : t('change_password')}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications')}
          </CardTitle>
          <CardDescription>{t('control_notifications')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'emailNotifs' as const, label: t('email_notifications'), desc: t('email_updates') },
            { key: 'pushNotifs' as const, label: t('push_notifications'), desc: t('browser_alerts') },
            { key: 'assessmentReminders' as const, label: t('assessment_reminders'), desc: t('exam_notices') },
            { key: 'progressUpdates' as const, label: t('progress_updates'), desc: t('weekly_summaries') },
            { key: 'gamificationUpdates' as const, label: t('gamification_updates'), desc: t('xp_level_notifications') },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={notifPrefs[key]}
                onCheckedChange={(checked) => setNotifPrefs({ ...notifPrefs, [key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('language')}
          </CardTitle>
          <CardDescription>{t('select_language')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('es')}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${language === 'es' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${language === 'en' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
            >
              🇺🇸 English
            </button>
          </div>
          {language === 'en' && (
            <p className="text-sm text-muted-foreground mt-3">
              ✅ Language set to English. Some pages are still being translated.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
