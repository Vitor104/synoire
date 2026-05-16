import type { Variants } from 'motion/react'
import { pageStaggerEase } from '@/motion/pageStagger'

const childDuration = 0.42

export const scrollRevealViewport = {
  once: true,
  margin: '-80px' as const,
}

/** Container for scroll-triggered section reveals. */
export function scrollRevealContainer(reduced: boolean): Variants {
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

export function scrollRevealListInner(reduced: boolean): Variants {
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

export function scrollRevealItem(reduced: boolean): Variants {
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
