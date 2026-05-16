import type { Variants } from 'motion/react'

/** Easing alinhado ao restante do app (hero, cards). */
export const pageStaggerEase: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
]

const childDuration = 0.42

/** Container: orquestra `staggerChildren` nos filhos com `pageStaggerItem`. */
export function pageStaggerContainer(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0, delayChildren: 0 },
      },
    }
  }
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.065,
        delayChildren: 0.05,
      },
    },
  }
}

/** Lista/cards: um nível extra de cascata dentro de uma página já com `pageStaggerContainer`. */
export function pageStaggerListInner(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0, delayChildren: 0 },
      },
    }
  }
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.055,
        delayChildren: 0.06,
      },
    },
  }
}

/** Item filho de um container com `pageStaggerContainer`. */
export function pageStaggerItem(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    }
  }
  return {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: childDuration, ease: pageStaggerEase },
    },
  }
}
