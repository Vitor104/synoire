import { useCallback, useMemo, useState } from 'react'
import { useUserPlan } from '@/contexts/UserPlanContext'
import {
  DEFAULT_IMMERSIVE_THEME_ID,
  getImmersiveTheme,
  readSelectedTheme,
  writeSelectedTheme,
  type ImmersiveThemeId,
} from '@/lib/immersiveThemes'

export function useImmersiveTheme() {
  const { hasGlowAccess } = useUserPlan()
  const [selectedThemeId, setSelectedThemeId] = useState<ImmersiveThemeId>(
    () => readSelectedTheme(),
  )

  const effectiveThemeId = useMemo(() => {
    const theme = getImmersiveTheme(selectedThemeId)
    if (theme?.isPremium && !hasGlowAccess) return DEFAULT_IMMERSIVE_THEME_ID
    return selectedThemeId
  }, [selectedThemeId, hasGlowAccess])

  const setTheme = useCallback(
    (id: ImmersiveThemeId) => {
      const theme = getImmersiveTheme(id)
      if (!theme) return false
      if (theme.isPremium && !hasGlowAccess) return false
      setSelectedThemeId(id)
      writeSelectedTheme(id)
      return true
    },
    [hasGlowAccess],
  )

  return { selectedThemeId, effectiveThemeId, setTheme }
}
