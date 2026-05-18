import {
  SUBJECT_NAME_MAX,
  SUBJECT_NAME_MIN,
  type CreateUserGoalInput,
  type GoalPeriod,
} from './types'

export function isGoalPeriod(value: string): value is GoalPeriod {
  return value === 'weekly' || value === 'monthly'
}

export function validateSubjectName(
  name: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = name.trim()
  if (!value) {
    return { ok: false, error: 'Informe o assunto da meta.' }
  }
  if (value.length < SUBJECT_NAME_MIN) {
    return { ok: false, error: `Mínimo de ${SUBJECT_NAME_MIN} caracteres.` }
  }
  if (value.length > SUBJECT_NAME_MAX) {
    return { ok: false, error: `Máximo de ${SUBJECT_NAME_MAX} caracteres.` }
  }
  return { ok: true, value }
}

export function validateTargetHours(
  hours: number,
): { ok: true; targetMinutes: number } | { ok: false; error: string } {
  if (!Number.isFinite(hours) || hours <= 0) {
    return { ok: false, error: 'Informe um valor de horas maior que zero.' }
  }
  const targetMinutes = Math.round(hours * 60)
  if (targetMinutes <= 0) {
    return { ok: false, error: 'Informe um valor de horas maior que zero.' }
  }
  return { ok: true, targetMinutes }
}

export function validateCreateGoalInput(
  input: {
    hubId: string
    subjectName: string
    targetHours: number
    period: string
  },
): { ok: true; value: CreateUserGoalInput } | { ok: false; error: string } {
  if (!input.hubId.trim()) {
    return { ok: false, error: 'Selecione um hub para a meta.' }
  }

  const subject = validateSubjectName(input.subjectName)
  if (!subject.ok) return subject

  const target = validateTargetHours(input.targetHours)
  if (!target.ok) return target

  if (!isGoalPeriod(input.period)) {
    return { ok: false, error: 'Período inválido.' }
  }

  return {
    ok: true,
    value: {
      hubId: input.hubId,
      subjectName: subject.value,
      targetMinutes: target.targetMinutes,
      period: input.period,
    },
  }
}
