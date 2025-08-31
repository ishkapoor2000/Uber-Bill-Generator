export function generateTripKey(): string {
  // uuid-like key: 8-4-4-4-12 hex segments
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(-4)
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

const STATE_CODES = [
  "AP",
  "AR",
  "AS",
  "BR",
  "CG",
  "CH",
  "DD",
  "DL",
  "GA",
  "GJ",
  "HR",
  "HP",
  "JH",
  "JK",
  "KA",
  "KL",
  "LA",
  "LD",
  "MH",
  "ML",
  "MN",
  "MP",
  "MZ",
  "NL",
  "OD",
  "PB",
  "PY",
  "RJ",
  "SK",
  "TN",
  "TS",
  "TR",
  "UK",
  "UP",
  "WB",
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomLetters(n: number) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let s = ""
  for (let i = 0; i < n; i++) s += letters[Math.floor(Math.random() * letters.length)]
  return s
}

function pad(num: number, width: number) {
  const s = num.toString()
  return s.length >= width ? s : "0".repeat(width - s.length) + s
}

export function generateIndianPlate(): string {
  const state = randomFrom(STATE_CODES)
  const rto = pad(Math.floor(Math.random() * 99) + 1, 2) // 01-99
  const series = randomLetters(2)
  const number = pad(Math.floor(Math.random() * 9999) + 1, 4) // 0001-9999
  return `${state}${rto}${series}${number}`
}
