"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatInr, formatCompactDateTime, formatReceiptDate, formatTimeRange, getPartOfDay } from "@/lib/format"
import { generateTripKey, generateIndianPlate } from "@/lib/random"

type ExtraItem = {
  id: string
  label: string
  amount: number // negative for promotions/discounts
}

export default function Page() {
  const [username, setUsername] = useState("Rajan Kapoor")
  const [rideType, setRideType] = useState("Go Sedan")
  const [driverName, setDriverName] = useState("Ashish")
  const [driverPlate, setDriverPlate] = useState(generateIndianPlate())

  const [tripCharge, setTripCharge] = useState<number>(150)
  const [gstIncluded, setGstIncluded] = useState<number>(0) // displayed as included in total
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([])

  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash")

  // Times and locations (defaults)
  const nowIso = useMemo(() => new Date().toISOString().slice(0, 16), [])
  const oneHourEarlierIso = useMemo(() => {
    const d = new Date()
    d.setHours(d.getHours() - 1)
    return d.toISOString().slice(0, 16)
  }, [])

  const [rideStartTime, setRideStartTime] = useState(oneHourEarlierIso) // yyyy-MM-ddTHH:mm
  const [rideEndTime, setRideEndTime] = useState(nowIso)
  const [startLocation, setStartLocation] = useState(
    "C2/65-72, Pocket 2, Block C, Rohini, New Delhi, Delhi, 110089, India",
  )
  const [endLocation, setEndLocation] = useState(
    "nearby Charms Castle, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003, India",
  )

  const [distanceKm, setDistanceKm] = useState<number>(9.3)
  const [totalHoursOverride, setTotalHoursOverride] = useState<string>("") // optional override in hours

  // Bill generation date
  const [billDateIso, setBillDateIso] = useState(nowIso)

  // Trip page key
  const [tripKey, setTripKey] = useState(generateTripKey())

  // Derived values
  const totalExtras = extraItems.reduce((sum, it) => sum + (Number.isFinite(it.amount) ? it.amount : 0), 0)
  const total = (Number.isFinite(tripCharge) ? tripCharge : 0) + totalExtras

  const rideStart = rideStartTime ? new Date(rideStartTime) : undefined
  const rideEnd = rideEndTime ? new Date(rideEndTime) : undefined

  const durationMs = rideStart && rideEnd ? Math.max(0, rideEnd.getTime() - rideStart.getTime()) : 0
  const durationMinutes = Math.round(durationMs / (1000 * 60))
  const computedDurationText = formatTimeRange(durationMinutes) // e.g., "1 hours 50 minutes"

  const durationText = totalHoursOverride
    ? `${Number.parseFloat(totalHoursOverride || "0").toFixed(2)} hours`
    : computedDurationText

  const computedPartOfDay = getPartOfDay(rideEnd)
  const [partOfDayMode, setPartOfDayMode] = useState<"auto" | "morning" | "afternoon" | "evening" | "night">("auto")
  const partOfDay = partOfDayMode === "auto" ? computedPartOfDay : partOfDayMode

  const billDate = billDateIso ? new Date(billDateIso) : new Date()

  function addExtra() {
    setExtraItems((prev) => [...prev, { id: crypto.randomUUID(), label: "Extra charge", amount: 0 }])
  }
  function removeExtra(id: string) {
    setExtraItems((prev) => prev.filter((e) => e.id !== id))
  }
  function updateExtra(id: string, patch: Partial<ExtraItem>) {
    setExtraItems((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  function regeneratePlate() {
    setDriverPlate(generateIndianPlate())
  }
  function regenerateKey() {
    setTripKey(generateTripKey())
  }

  function handlePrint() {
    if (!billDate) return
    const prevTitle = document.title
    const day = billDate.getDate().toString().padStart(2, "0")
    const month = billDate.toLocaleString("en-US", { month: "long" })
    const year = billDate.getFullYear()
    const rand = Math.floor(100000 + Math.random() * 900000)
    const filename = `Receipt_${day}${month}${year}_${rand}.pdf`
    document.title = filename
    const restore = () => {
      document.title = prevTitle
      window.removeEventListener("afterprint", restore)
    }
    window.addEventListener("afterprint", restore)
    window.print()
  }

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      {/* Uber-style header */}
      <header className="w-full bg-black text-white print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center">
          <div className="text-2xl font-semibold tracking-tight" aria-label="Uber logo">
            Uber
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
        {/* Form */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-balance">Bill Generator</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rideType">Ride type</Label>
                  <Select value={rideType} onValueChange={setRideType}>
                    <SelectTrigger id="rideType">
                      <SelectValue placeholder="Select ride type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Moto">Moto</SelectItem>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Go Sedan">Go Sedan</SelectItem>
                      <SelectItem value="Premier">Premier</SelectItem>
                      <SelectItem value="Uber XL">Uber XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="driverName">Driver name</Label>
                  <Input id="driverName" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="driverPlate">Driver license plate</Label>
                  <div className="flex gap-2">
                    <Input id="driverPlate" value={driverPlate} onChange={(e) => setDriverPlate(e.target.value)} />
                    <Button type="button" variant="outline" onClick={regeneratePlate}>
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tripCharge">Trip charge (includes GST)</Label>
                  <Input
                    id="tripCharge"
                    type="number"
                    step="0.01"
                    value={Number.isFinite(tripCharge) ? tripCharge : 0}
                    onChange={(e) => setTripCharge(Number.parseFloat(e.target.value || "0"))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="gst">GST (included in total)</Label>
                  <Input
                    id="gst"
                    type="number"
                    step="0.01"
                    value={Number.isFinite(gstIncluded) ? gstIncluded : 0}
                    onChange={(e) => setGstIncluded(Number.parseFloat(e.target.value || "0"))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label>Extra charges (if any)</Label>
                <div className="flex flex-col gap-3">
                  {extraItems.map((item) => (
                    <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_160px_80px]">
                      <Input
                        aria-label="Extra label"
                        placeholder="Label (e.g., UP interstate charges, Rider Promotion)"
                        value={item.label}
                        onChange={(e) => updateExtra(item.id, { label: e.target.value })}
                      />
                      <Input
                        aria-label="Amount"
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => updateExtra(item.id, { amount: Number.parseFloat(e.target.value || "0") })}
                      />
                      <Button type="button" variant="outline" onClick={() => removeExtra(item.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={addExtra}>
                    Add extra
                  </Button>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="paymentMode">Payment mode</Label>
                  <Select value={paymentMode} onValueChange={(v: "cash" | "online") => setPaymentMode(v)}>
                    <SelectTrigger id="paymentMode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="billDate">Bill generation date</Label>
                  <Input
                    id="billDate"
                    type="datetime-local"
                    value={billDateIso}
                    onChange={(e) => setBillDateIso(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rideStartTime">Ride start time</Label>
                  <Input
                    id="rideStartTime"
                    type="datetime-local"
                    value={rideStartTime}
                    onChange={(e) => setRideStartTime(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rideEndTime">Ride end time</Label>
                  <Input
                    id="rideEndTime"
                    type="datetime-local"
                    value={rideEndTime}
                    onChange={(e) => setRideEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startLocation">Ride start location</Label>
                  <Textarea
                    id="startLocation"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endLocation">Ride end location</Label>
                  <Textarea id="endLocation" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="distanceKm">Total distance (km)</Label>
                  <Input
                    id="distanceKm"
                    type="number"
                    step="0.01"
                    value={Number.isFinite(distanceKm) ? distanceKm : 0}
                    onChange={(e) => setDistanceKm(Number.parseFloat(e.target.value || "0"))}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="totalHoursOverride">Total time (hrs) — optional override</Label>
                  <Input
                    id="totalHoursOverride"
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculated from start/end; enter to override"
                    value={totalHoursOverride}
                    onChange={(e) => setTotalHoursOverride(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="partOfDay">Time of day (for greeting)</Label>
                  <Select value={partOfDayMode} onValueChange={(v: any) => setPartOfDayMode(v)}>
                    <SelectTrigger id="partOfDay">
                      <SelectValue placeholder="Select time of day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (from ride end)</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <Label htmlFor="tripKey">Trip page link key</Label>
              <div className="flex gap-2">
                <Input id="tripKey" value={tripKey} onChange={(e) => setTripKey(e.target.value)} />
                <Button type="button" variant="outline" onClick={regenerateKey}>
                  Regenerate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This key is used in: https://riders.uber.com/trips/{tripKey}
              </p>
            </section>

            <section className="rounded-md bg-muted p-4">
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>Total (calculated)</span>
                  <strong>{formatInr(total)}</strong>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Receipt Preview */}
        <Card className="border-gray-200 print:shadow-none print:border-0">
          <CardHeader className="flex items-center justify-between print:hidden">
            <CardTitle className="text-balance">Receipt Preview</CardTitle>
            <Button type="button" onClick={handlePrint}>
              Print receipt
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <UberReceipt
              username={username}
              rideType={rideType}
              driverName={driverName}
              driverPlate={driverPlate}
              tripCharge={tripCharge}
              extraItems={extraItems}
              total={total}
              gstIncluded={gstIncluded}
              paymentMode={paymentMode}
              cashDate={rideEndTime ? new Date(rideEndTime) : undefined}
              startLocation={startLocation}
              endLocation={endLocation}
              rideStart={rideStart}
              rideEnd={rideEnd}
              distanceKm={distanceKm}
              durationText={durationText}
              partOfDay={partOfDay}
              billDate={billDate}
              tripKey={tripKey}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

type ReceiptProps = {
  username: string
  rideType: string
  driverName: string
  driverPlate: string
  tripCharge: number
  extraItems: ExtraItem[]
  total: number
  gstIncluded: number
  paymentMode: "cash" | "online"
  cashDate?: Date
  startLocation: string
  endLocation: string
  rideStart?: Date
  rideEnd?: Date
  distanceKm: number
  durationText: string
  partOfDay: "morning" | "afternoon" | "evening" | "night"
  billDate: Date
  tripKey: string
}

function UberReceipt(props: ReceiptProps) {
  const {
    username,
    rideType,
    driverName,
    driverPlate,
    tripCharge,
    extraItems,
    total,
    gstIncluded,
    paymentMode,
    cashDate,
    startLocation,
    endLocation,
    rideStart,
    rideEnd,
    distanceKm,
    durationText,
    partOfDay,
    billDate,
    tripKey,
  } = props

  const firstName = username.trim().split(" ")[0] || username

  const paymentHeaderLine = paymentMode === "cash" ? "Cash" : "Online"
  const cashDateLine = paymentMode === "cash" && cashDate ? formatCompactDateTime(cashDate) : undefined

  const startLine = rideStart
    ? `${rideStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | ${startLocation}`
    : undefined
  const endLine = rideEnd
    ? `${rideEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | ${endLocation}`
    : undefined

  const rideSummaryLine = `${rideType}     ${distanceKm.toFixed(2)} kilometres | ${durationText}`
  const dayText = formatReceiptDate(billDate)

  const greetingLine = `Here's your receipt for your ride, ${firstName}`
  const hopeLine = `We hope you enjoyed your ride this ${partOfDay}.`
  const visitTripText = `Visit the trip page for more information, including invoices (where available)`

  return (
    <div className="w-full">
      <div className="mx-auto max-w-xl bg-white text-black print:max-w-none">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="text-3xl font-semibold tracking-tight" aria-label="Uber logo">
            Uber
          </div>
          <div className="text-sm text-gray-700">{dayText}</div>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="mt-1 text-lg font-semibold">{greetingLine}</div>
          <div className="text-sm text-gray-700">{hopeLine}</div>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatInr(total)}</span>
          </div>

          <div className="mt-2 flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between text-gray-800">
              <span>Trip charge</span>
              <span>{formatInr(tripCharge)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-800">
              <span>Subtotal</span>
              <span>{formatInr(tripCharge)}</span>
            </div>
            {extraItems.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-gray-800">
                <span>{it.label || "Extra"}</span>
                <span className={cn(it.amount < 0 && "text-red-600")}>
                  {it.amount < 0 ? `-${formatInr(Math.abs(it.amount))}` : formatInr(it.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="text-sm font-medium">Payments</div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-800">{formatInr(total)}</span>
          </div>
          <div className="mt-3 text-sm text-gray-700">
            <p>{visitTripText}</p>
            <p>
              The total of {formatInr(total)} has a GST of {formatInr(gstIncluded)} included.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="text-sm text-gray-700">{paymentHeaderLine}</div>
          {cashDateLine && <div className="text-sm text-gray-700">{cashDateLine}</div>}
          {startLine && <div className="text-sm text-gray-700">{startLine}</div>}
          {endLine && <div className="text-sm text-gray-700">{endLine}</div>}
          <div className="pt-1 text-sm text-gray-700">{rideSummaryLine}</div>
        </div>

        {/* Driver */}
        <div className="border-b border-gray-200 p-4">
          <div className="text-sm text-gray-800">You rode with {driverName}</div>
          <div className="text-sm text-gray-700">License Plate: {driverPlate}</div>
        </div>

        {/* Footer notes */}
        <div className="p-4 text-sm text-gray-700">
          <div className="mb-3">
            <a
              href={`https://riders.uber.com/trips/${tripKey}`}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              https://riders.uber.com/trips/{tripKey}
            </a>
          </div>
          <p>
            Fares are inclusive of GST. Please download the tax invoice from the trip detail page for a full tax
            breakdown.
          </p>
        </div>
      </div>
    </div>
  )
}
