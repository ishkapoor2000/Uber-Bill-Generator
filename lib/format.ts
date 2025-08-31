export function formatInr(value: number): string {
  if (!Number.isFinite(value)) return "₹0.00"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(value)
}

export function formatCompactDateTime(date?: Date) {
  if (!date) return ""
  const pad = (n: number) => n.toString().padStart(2, "0")
  const dd = pad(date.getDate())
  const mm = pad(date.getMonth() + 1)
  const yyyy = date.getFullYear()
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  // e.g., 30/08/2025 13:35
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function formatReceiptDate(date?: Date) {
  if (!date) return ""
  // e.g., 30 August 2025
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
}

export function formatTimeRange(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const hText = `${h} ${h === 1 ? "hour" : "hours"}`
  const mText = `${m} ${m === 1 ? "minute" : "minutes"}`
  if (h === 0) return mText
  if (m === 0) return hText
  return `${hText} ${mText}`
}

export function getPartOfDay(date?: Date): "morning" | "afternoon" | "evening" | "night" {
  if (!date) return "morning"
  const h = date.getHours()
  if (h >= 5 && h < 12) return "morning"
  if (h >= 12 && h < 17) return "afternoon"
  if (h >= 17 && h < 22) return "evening"
  return "night"
}
