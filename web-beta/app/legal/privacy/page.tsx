export const metadata = {
  title: "Pixelfy Privacy — AI on-device • Auth standby",
  description: "Pixelfy Privacy Policy v1.0 — July 15, 2026 — GDPR • CCPA • photos stay on your device"
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0F0B1A] text-[#FEFCFF]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="https://betapixelfy.vercel.app" className="text-sm text-[#06FFA5]">← back to Pixelfy Beta</a>
        <h1 className="text-4xl font-black mt-4 tracking-tight">
          <span className="bg-gradient-to-r from-[#8B5CF6] via-[#06FFA5] to-[#FF3B9A] bg-clip-text text-transparent">Pixelfy</span> Privacy Policy
        </h1>
        <p className="text-zinc-400 mt2">v1.0 — July 15, 2026 — AGP 9 / Kotlin 2.4 build</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-zinc-200">
          <section className="bg-[#1A1328]/80 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white">1. Photos stay on your device.</h2>
            <p className="mt-2 text-zinc-300">
              By default <b>Pixelfy runs 100% offline</b>. All 63 image operations — including 10 AI models
              (Real-ESRGAN, U²Net, GFPGAN, Denoise, Deblur…) — run with TensorFlow Lite GPU on-device.
              Your photos <b>never leave your phone</b> unless you explicitly enable Pixelfy Cloud Sync.
              <br/><br/>
              <span className="px-3 py-1 rounded-full bg-[#06FFA5]/10 text-[#06FFA5] text-xs font-semibold">Auth standby • Local Mode default</span>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. What we collect — minimum</h2>
            <div className="mt3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="text-zinc-400 border-b border-white/10">
                  <th className="text-left py-2">Data</th><th className="text-left py-2">Collected?</th><th className="text-left py-2">Why</th></tr></thead>
                <tbody className="[&>tr]:border-b [&>tr]:border-white/[0.06]">
                  <tr><td className="py2">Photos you edit</td><td><b className="text-[#FF3B9A]">NO — on-device</b></td><td>Local TFLite processing</td></tr>
                  <tr><td>Email</td><td>Opt-in only</td><td>Supabase Magic Link — Auth standby by default</td></tr>
                  <tr><td>Crash logs</td><td>Anonymized</td><td>Stability — Firebase Crashlytics</td></tr>
                  <tr><td>Analytics events</td><td>Opt-out — op_type, duration_ms only</td><td>Product improvement — PostHog EU self-host</td></tr>
                  <tr><td>Purchase</td><td>If Pro</td><td>Google Play Billing / RevenueCat</td></tr>
                  <tr><td>Location / Contacts / Mic / SMS / Advertising ID</td><td><b className="text-[#06FFA5]">NEVER</b></td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. AI = on-device</h2>
            <p>Face restore, background remove, upscale — all run locally. No cloud AI unless you explicitly opt into “Cloud Pro Enhance” — coming later — default OFF.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Your rights — GDPR / CCPA / VCDPA / CPA</h2>
            <ul className="list-disc pl-5 space-y-1 text-zinc-300">
              <li>Access • Delete • Correct • Export • Opt-out — Settings → Privacy → “My Data”</li>
              <li>Right to be forgotten: Settings → Delete Account → biometric + type “DELETE” → full wipe &lt;24h</li>
              <li>CCPA: We <b>do NOT sell, share, or use sensitive personal information</b> for cross-context behavioral advertising — ever.</li>
              <li>Virginia / Colorado: explicit consent for sensitive data — biometric face mesh processed on-device only, never stored</li>
              <li>Contact DPO: <a className="text-[#06FFA5] underline" href="mailto:dpo@pixelfy.app">dpo@pixelfy.app</a> — 30d GDPR / 45d CCPA</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Security</h2>
            <p>
              TLS 1.3 • Certificate pinning SPKI ×2 • AES-256-GCM EncryptedDataStore • Room SQLCipher optional • Play Integrity • R8 fullMode obfuscation • AGP 9.1.1 • Kotlin 2.4.0
              <br/>Pen-test summary published at <a className="text-[#06FFA5] underline" href="/security">pixelfy.app/security</a>
            </p>
          </section>

          <section className="bg-[#1A1328]/70 border border-[#8B5CF6]/20 rounded-3xl p-5">
            <h3 className="font-bold">Pixelfy Owner — Local Test Mode</h3>
            <p className="text-zinc-300 text-sm mt-1">
              You’re viewing the Beta site at <b>betapixelfy.vercel.app</b> — hosted Vercel Hobby — $0.<br/>
              Android app: Auth standby • Local Mode default • all 63 ops unlocked • Supabase sync paused.<br/>
              Owner license: <code className="text-[#06FFA5]">PXFY-OWNER-2026-UNLIMITED</code><br/>
              7-tap Pixelfy logo → Owner Console
            </p>
          </section>

          <p className="text-xs text-zinc-500">
            Controller: Pixelfy Labs, Rawalpindi, PK • EU Rep: Pixelfy EU Ltd., Dublin, IE<br/>
            Effective: July 15, 2026 • Version: Privacy-Policy-v1.0-20260715<br/>
            Changes: material changes → in-app notice 30 days before • history: pixelfy.app/legal/privacy/archive
          </p>
        </div>

        <div className="mt-12 text-center text-xs text-zinc-500">
          <a href="https://betapixelfy.vercel.app" className="underline text-[#8B5CF6]">← back to Beta Pioneers</a> • 
          <a href="/legal/terms" className="underline ml-3">Terms</a> • 
          <a href="/security" className="underline ml-3">Security</a>
        </div>
      </div>
    </main>
  )
}
