export const metadata = { title: "Pixelfy Terms — Beta" }
export default function TermsPage(){
  return (
    <main className="min-h-screen bg-[#0F0B1A] text-[#FEFCFF]">
      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-invert">
        <a href="https://betapixelfy.vercel.app" className="text-[#06FFA5] text-sm no-underline">← back to Pixelfy Beta</a>
        <h1 className="text-3xl font-black mt-4"><span className="bg-gradient-to-r from-[#8B5CF6] via-[#06FFA5] to-[#FF3B9A] bg-clip-text text-transparent">Pixelfy</span> Terms of Service — Beta</h1>
        <p className="text-zinc-400">v1.0 — July 15, 2026 • Pixelfy Labs, Rawalpindi, PK</p>
        <h2>1. Local Mode — Auth standby</h2>
        <p>Pixelfy runs fully offline by default. Cloud sync (Supabase) is opt-in and currently on standby for Beta testers. You own your photos — always.</p>
        <h2>2. License</h2>
        <p>Free tier: 38 image ops, personal non-commercial use, attribution “Made with Pixelfy ✨” toggleable — not forced.</p>
        <p>Pro: $4.99/mo • $29.99/yr • <b>$49 lifetime</b> — unlocks all 63 ops incl. 25 AI Pro, unlimited export, AVIF/HEIC/TIFF16, batch, LUT import, cloud sync when enabled.</p>
        <p>Owner: <code>PXFY-OWNER-2026-UNLIMITED</code> — all features unlocked — internal / reviewer builds — not transferable — you’re reading this because you ARE the owner 😉</p>
        <h2>3. AI — on-device</h2>
        <p>All AI enhancement (Real-ESRGAN, U²Net, GFPGAN, etc.) runs on-device via TensorFlow Lite GPU. No photo uploads in Local Mode. Cloud AI (optional, future) will require explicit consent.</p>
        <h2>4. Acceptable use</h2>
        <p>No non-consensual intimate imagery, no CSAM, no deepfake political disinformation with intent to deceive — we will cooperate with lawful requests — PK + EU jurisdiction.</p>
        <h2>5. Subscriptions</h2>
        <p>Managed via Google Play Billing. Cancel anytime in Play Store → Subscriptions. Pro features remain until period end. Lifetime = perpetual, per Google Play, tied to Google account.</p>
        <h2>6. Warranty / Liability</h2>
        <p>Provided “as is”. AI enhancement is probabilistic — face restore may hallucinate — always review before publishing — especially for editorial / ID use. Max liability = amount paid in 12 months prior ($0 for Free / Beta).</p>
        <h2>7. Beta — Auth standby</h2>
        <p>Beta builds (0.9.x / 1.0-beta) may crash, lose edits, change formats. Auto-save every 2s mitigates. By using Beta you accept: “I’m testing Pixelfy locally — Auth on standby — I’m cool with that.”</p>
        <p className="text-xs text-zinc-500 mt-8">Contact: legal@pixelfy.app • dpo@pixelfy.app • https://betapixelfy.vercel.app</p>
      </div>
    </main>
  )
}
