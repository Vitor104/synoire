import fs from 'fs'

for (const file of [
  'src/components/dashboard/StreakPredictionCard.tsx',
]) {
  let s = fs.readFileSync(file, 'utf8')
  if (!s.includes("from 'motion/react'")) {
    s = s.replace(/<\/?motion\.motion\.motion\.div/g, (m) => m.replace(/motion\./g, ''))
    s = s.replace(/<\/?motion\.motion\.motion\.div/g, (m) => m.replace(/motion\./g, ''))
    s = s.replace(/<\/?motion\.motion\.div/g, (m) => m.replace(/motion\./g, ''))
    s = s.replace(/<\/?motion\.div/g, (m) => m.replace('motion.', ''))
  }
  fs.writeFileSync(file, s)
  console.log('fixed', file)
}
