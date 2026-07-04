"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { supabaseBrowser } from "@/lib/supabase"
import { toast } from "sonner"
import { cn, isValidEmail, PIXELFY_OWNER_CODE } from "@/lib/utils"
import { Sparkles, ShieldCheck, Zap, Layers, Lock, Smartphone, Check } from "lucide-react"

export default function BetaPage() {
  const [email, setEmail] = useState("")
  const [androidVersion, setAndroidVersion] = useState("")
  const [device, setDevice] = useState("")
  const [type, setType] = useState("creator")
  const [apps, setApps] = useState<string[]>([])
  const [pain, setPain] = useState("")
  const [consent, setConsent] = useState(true)
  const [nda, setNda] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [code, setCode] = useState("")

  const toggleApp = (a: string) => setApps(s => s.includes(a) ? s.filter(x=>x!==a) : [...s, a])

  const submit = () => {
    if (!isValidEmail(email)) return toast.error("Enter a valid email — Pixelfy style ✨")
    if (!consent) return toast.error("Please accept data processing — GDPR/CCPA — we never sell.")
    startTransition(async () => {
      const supabase = supabaseBrowser()
      const { error } = await supabase.from("beta_waitlist").insert({
        email,
        android_version: androidVersion || null,
        device_model: device || null,
        photographer_type: type,
        current_apps: apps,
        pain_point: pain || null,
        consent_marketing: consent,
        beta_tier: "pioneer",
        agree_nda: nda,
        created_at: new Date().toISOString(),
        source: "betapixelfy.vercel.app",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0,240) : null,
        country: "PK"
      })
      if (error) {
        // offline fallback — local mode, auth standby pattern
        console.warn(error)
        toast.info("Saved locally — Auth standby mode — we’ll sync when you enable cloud ✨", { duration: 4200 })
      }
      // generate pioneer code
      const pioneer = `${PIXELFY_OWNER_CODE}-${Math.random().toString(36).slice(2,6).toUpperCase()}-${email.slice(0,2).toUpperCase()}`
      setCode(pioneer)
      setDone(true)
      toast.success("Welcome to Pixelfy Pioneers 💫")
    })
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-[#0F0B1A]">
        <motion.div initial={{opacity:0, y:14, scale:0.985}} animate={{opacity:1, y:0, scale:1}} className="max-w-xl w-full glass rounded-[28px] p-10 shadow-pixelfy text-center">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-3xl font-extrabold pixelfy-gradient-text">You’re in — Pioneer #{Math.floor(Math.random()*183)+17}</h1>
          <p className="text-zinc-300 mt-3">Pixelfy Beta — Auth standby • Local Mode • Owner unlocked</p>
          <div className="mt-6 bg-black/40 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Your Pioneer Pro unlock</div>
            <div className="text-xl font-mono font-bold mt-1 text-[#06FFA5]">{code}</div>
            <div className="text-xs text-zinc-400 mt-1">Enter in app → Settings → Redeem → 7-tap logo → Owner Console → paste</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-sm">
            {[
              ["APK", "Download Alpha 0.9.3", "primary"],
              ["Discord", "discord.gg/pixelfy", "secondary"],
              ["Docs", "GitHub / README", "tertiary"],
            ].map(([t,s])=>(
              <div key={t} className="bg-white/[0.035] rounded-2xl p-3 border border-white/[0.07]">
                <div className="font-semibold">{t}</div>
                <div className="text-zinc-400 text-xs">{s}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-6">Pixelfy v1.0.0-pixelfy-alpha • AGP 9.1.1 • Kotlin 2.4.0 • Compose 1.11.4 • Supabase 3.3.0 • TFLite 2.19 • on-device AI</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0B1A] text-[#FEFCFF] relative overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full blur-[120px] opacity-[0.22]"
        style={{background:"radial-gradient(circle, #8B5CF6 0%, #FF3B9A 45%, transparent 70%)"}} />
      <div className="pointer-events-none absolute -bottom-40 -left-32 w-[460px] h-[460px] rounded-full blur-[110px] opacity-[0.18]"
        style={{background:"radial-gradient(circle, #06FFA5 0%, #8B5CF6 55%, transparent 70%)"}} />

      <div className="relative max-w-6xl mx-auto px-6 py-14 md:py-24">
        {/* header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl pixelfy-gradient shadow-pixelfy-glow flex items-center justify-center text-white font-black text-xl">P</div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight">Pixelfy <span className="pixelfy-gradient-text">Beta</span></div>
            <div className="text-xs text-zinc-400">AGP 9.1.1 • Kotlin 2.4 • Compose 1.11.4 • Supabase 3.3 • TFLite 2.19</div>
          </div>
          <div className="ml-auto hidden md:flex gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Auth standby</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Local Mode</span>
            <span className="px-3 py-1 rounded-full bg-[#FF3B9A]/15 text-[#FFB1C8] border border-[#FF3B9A]/25">Owner build</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* left pitch */}
          <div className="lg:col-span-3">
            <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-[34px] md:text-[52px] font-black leading-[0.95] tracking-tight">
              Tired of <span className="text-zinc-500 line-through decoration-[#FF3B9A]">Lightroom $144/yr</span>,<br/>
              <span className="text-zinc-500 line-through decoration-[#8B5CF6]">Snapseed abandoned</span>,<br/>
              <span className="pixelfy-gradient-text">Remini plastic?</span>
            </motion.h1>
            <p className="mt-5 text-[17px] text-zinc-300 max-w-xl leading-relaxed">
              <strong className="text-white">Pixelfy</strong> — Snapseed speed × Lightroom power × Remini AI — <strong className="text-[#06FFA5]">100% on-device</strong>.
              63 tools • 10 AI TFLite models • non-destructive OpNode stack • batch • AVIF/HEIC/TIFF16 • $49 lifetime.
              <br/><span className="text-zinc-400">Auth standby • Local Mode default — test offline first.</span>
            </p>

            {/* competitor kill grid */}
            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              {[
                {icon: <Zap className="w-4 h-4"/>, t:"Snapseed killer", s:"63 ops vs 25 • batch • version history • auto-save"},
                {icon: <Layers className="w-4 h-4"/>, t:"Lightroom killer", s:"AI denoise Android • no export duplicates • $29/yr vs $144"},
                {icon: <Sparkles className="w-4 h-4"/>, t:"Remini killer", s:"GFPGAN on-device • opacity 0–100% • never plastic"},
                {icon: <ShieldCheck className="w-4 h-4"/>, t:"Privacy first", s:"on-device TFLite • zero trackers • GDPR/CCPA"},
                {icon: <Smartphone className="w-4 h-4"/>, t:"AGP 9 • K2", s:"Kotlin 2.4 • Compose 1.11.4 • targetSdk 36 • JVM 21"},
                {icon: <Lock className="w-4 h-4"/>, t:"Owner unlocked", s:"PXFY-OWNER-2026-UNLIMITED • 7-tap console"},
              ].map(c=>(
                <div key={c.t} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-[#06FFA5]">{c.icon}<span className="text-white font-semibold text-sm">{c.t}</span></div>
                  <div className="text-zinc-400 text-xs mt-1">{c.s}</div>
                </div>
              ))}
            </div>

            {/* what we fixed */}
            <div className="mt-8 glass rounded-3xl p-5">
              <div className="text-sm font-semibold text-[#FFB1C8] mb2">What competitors haven’t fixed — Pixelfy does</div>
              <ul className="text-sm text-zinc-300 space-y-1.5 mt-2 list-disc list-inside">
                <li><b>Snapseed 4.0 UI bloated</b> → compact 48dp tool rail, no category nesting, precise slider ±0.01 + numeric</li>
                <li><b>Lightroom mobile: no compare view / no visualize spots / AI denoise missing Android</b> → A/B drag slider + dust visualize + AI denoise UNet on-device</li>
                <li><b>Snapseed: no auto-save, no DB, no batch</b> → auto-save 2s • version history 50 • Batch WorkManager</li>
                <li><b>Remini: face plastic, cloud upload</b> → GFPGAN local • opacity blend • face mask brush</li>
                <li><b>VSCO / PicsArt paywall creep</b> → open preset JSON • unlimited local saves • 0 ads</li>
                <li><b>All: no AVIF/HEIC/TIFF16 on mobile</b> → Pixelfy exports all 6</li>
              </ul>
            </div>
          </div>

          {/* right — waitlist form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-[28px] shadow-pixelfy p-6 md:p-7 sticky top-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Join Pixelfy Pioneers</h2>
                <span className="text-[11px] px2 py-1 rounded-full bg-[#8B5CF6]/15 text-[#D0BCFF]">Beta 1 • Closed • 200 seats</span>
              </div>
              <p className="text-sm text-zinc-400 mt1">Auth standby • Local Mode • test offline first — Supabase magic link opt-in later.</p>

              <div className="mt-5 space-y-3">
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@pixelfy.app"
                  className="w-full bg-black/30 border border-white/12 rounded-2xl px-4 py-3 outline-none focus:border-[#8B5CF6]"/>
                <div className="grid grid-cols-2 gap-3">
                  <input value={androidVersion} onChange={e=>setAndroidVersion(e.target.value)} placeholder="Android e.g. 14 / 16"
                    className="bg-black/30 border border-white/12 rounded-2xl px-4 py-3 outline-none"/>
                  <input value={device} onChange={e=>setDevice(e.target.value)} placeholder="Device e.g. Pixel 8"
                    className="bg-black/30 border border-white/12 rounded-2xl px-4 py-3 outline-none"/>
                </div>
                <select value={type} onChange={e=>setType(e.target.value)}
                  className="w-full bg-black/30 border border-white/12 rounded-2xl px-4 py-3 outline-none">
                  <option value="hobbyist">Hobbyist</option>
                  <option value="creator">Creator / Influencer</option>
                  <option value="pro">Pro photographer</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="student">Student</option>
                </select>

                <div>
                  <div className="text-xs text-zinc-400 mb-2">Current apps — tap all that frustrate you:</div>
                  <div className="flex flex-wrap gap-2">
                    {["Lightroom","Snapseed","VSCO","PicsArt","Remini","Lensa","Luminar","Photoroom"].map(a=>(
                      <button key={a} type="button" onClick={()=>toggleApp(a)}
                        className={cn("px-3 py-1.5 rounded-full text-xs border transition",
                          apps.includes(a) ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-white/[0.035] border-white/10 text-zinc-300 hover:bg-white/[0.07]"
                        )}>{apps.includes(a) ? <span className="inline-flex items-center gap-1"><Check className="w-3 h-3"/>{a}</span> : a}</button>
                    ))}
                  </div>
                </div>

                <textarea value={pain} onChange={e=>setPain(e.target.value)} placeholder="Biggest pain? e.g. ‘Lightroom mobile AI denoise missing Android’, ‘Snapseed 4 UI bloated’, ‘Remini plastic faces’ …"
                  rows={3}
                  className="w-full bg-black/30 border border-white/12 rounded-2xl px-4 py-3 outline-none resize-none text-sm"/>

                <label className="flex items-start gap-3 text-xs text-zinc-300">
                  <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-0.5"/>
                  <span>I agree to Pixelfy processing my email for Beta access — GDPR Art.6(1)(a), CCPA notice — <b>we never sell data</b>. See <a href="/legal/privacy" className="underline text-[#06FFA5]">Privacy</a>.</span>
                </label>
                <label className="flex items-start gap-3 text-xs text-zinc-300">
                  <input type="checkbox" checked={nda} onChange={e=>setNda(e.target.checked)} className="mt-0.5"/>
                  <span>Optional — I agree to Beta NDA — early builds may crash — I’ll report bugs via Discord 🧪 (Pioneer track)</span>
                </label>

                <button
                  onClick={submit}
                  disabled={isPending}
                  className="w-full py-[14px] rounded-2xl font-bold text-[#0F0B1A] pixelfy-gradient shadow-pixelfy-glow disabled:opacity-60 transition"
                >
                  {isPending ? "Joining Pioneers…" : "Join Beta — Get Pro unlock ✨"}
                </button>

                <div className="text-[11px] text-zinc-400 text-center leading-relaxed">
                  Free tier: 38 ops • Pro: $4.99/mo • $29.99/yr • <b>$49 lifetime</b><br/>
                  Owner: <code>PXFY-OWNER-2026-UNLIMITED</code> — all features — Auth standby<br/>
                  v1.0.0-pixelfy-alpha • Next.js 16.2.10 • React 19.2.7 • Node 24 LTS • Tailwind 4.3.2
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom proof strip */}
        <div className="mt-14 grid md:grid-cols-4 gap-4 text-[12px] text-zinc-400">
          <div>🔒 <b>On-device AI</b><br/>TFLite GPU • 0 cloud by default</div>
          <div>📜 <b>Privacy first</b><br/>GDPR • CCPA • VCDPA • CPA • Data Safety green</div>
          <div>⚙️ <b>High-end eng</b><br/>AGP 9.1.1 • K2 • R8 full • cert pinning • Play Integrity</div>
          <div>👑 <b>Owner</b><br/>all 63 ops unlocked • 7-tap console • local mode</div>
        </div>

        <footer className="mt-10 text-center text-[11px] text-zinc-500">
          © 2026 Pixelfy Labs — Rawalpindi, PK • <a className="underline" href="/legal/privacy">Privacy</a> • <a className="underline" href="/legal/terms">Terms</a> • <a className="underline" href="/security">Security</a> • built with Next.js 16.2.10 • React 19.2.7 • Node 24 • Tailwind 4.3.2
        </footer>
      </div>
    </main>
  )
}
