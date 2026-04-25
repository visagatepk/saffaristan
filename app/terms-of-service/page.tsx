import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — VisaGate.pk',
  description: 'Read the Terms of Service for VisaGate.pk by Defaste (Pvt) Ltd.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-14 text-center">
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-3">
            Terms of Service
          </h1>
          <p className="font-urdu text-gold/80 text-xl mb-4">سروس کی شرائط</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-body text-white/50">
            <span>Last Updated: April 2026</span>
            <span>·</span>
            <span>Governing Law: Islamic Republic of Pakistan</span>
          </div>
          <div className="mt-4 inline-block bg-white/10 border border-white/20 rounded-xl px-4 py-2">
            <p className="font-body text-white/70 text-xs">
              Parent Company: <span className="font-semibold text-white">Defaste (Pvt) Ltd</span>
              <span className="mx-2">·</span>
              NTN: <span className="font-semibold text-white">I4****71-1</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">

        {/* Language tabs */}
        <div className="flex items-center gap-3 mb-8">
          <a href="#en-terms" className="font-heading font-bold text-sm text-white bg-navy px-4 py-2 rounded-xl">
            English
          </a>
          <a href="#ur-terms" className="font-heading font-bold text-sm text-navy border border-navy px-4 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors">
            اردو
          </a>
        </div>

        {/* ── ENGLISH SECTION ── */}
        <div id="en-terms" className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-10 mb-8">
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-white text-sm">EN</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-navy text-xl">Terms of Service</h2>
              <p className="font-body text-gray-400 text-xs">English Version</p>
            </div>
          </div>

          {/* Critical warning box */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <p className="font-heading font-bold text-red-800 text-base mb-3">⚠️ Read This First</p>
            <div className="space-y-2 font-body text-red-700 text-sm">
              <p>• VisaGate.pk is a <strong>matching platform only</strong> — we do NOT process visas ourselves</p>
              <p>• Payments happen <strong>directly between you and the consultant</strong> — we do NOT handle money</p>
              <p>• We are <strong>NOT responsible</strong> for visa rejection, consultant quality, or immigration outcomes</p>
              <p>• Fake credentials or scams = <strong>permanent ban + legal action under PECA 2016</strong></p>
              <p>• You use this platform <strong>at your own risk</strong></p>
            </div>
          </div>

          <div className="space-y-8 font-body text-gray-600 text-sm leading-relaxed">

            {[
              {
                num: '1',
                title: 'What is VisaGate.pk?',
                content: (
                  <div className="space-y-3">
                    <p>VisaGate.pk is a free digital marketplace that connects Visa Seekers with Verified Visa Consultants across Pakistan. We are a platform — not a visa agency.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { role: 'Visa Seekers', desc: 'People looking for professional visa help and guidance.' },
                        { role: 'Visa Consultants', desc: 'Verified agents offering visa services — OEP/SECP licensed.' },
                      ].map(item => (
                        <div key={item.role} className="bg-navy-light rounded-xl p-4">
                          <p className="font-heading font-bold text-navy text-sm mb-1">{item.role}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
              {
                num: '2',
                title: 'Who Can Use VisaGate.pk?',
                content: (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="font-heading font-bold text-green-800 text-sm mb-2">✅ You CAN use if:</p>
                      <ul className="space-y-1.5 text-green-700 text-xs">
                        <li>• You are 18 years or older</li>
                        <li>• You provide truthful information</li>
                        <li>• You use it for lawful purposes only</li>
                        <li>• You have a valid CNIC or Passport</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="font-heading font-bold text-red-800 text-sm mb-2">❌ You CANNOT use if:</p>
                      <ul className="space-y-1.5 text-red-700 text-xs">
                        <li>• You are under 18 years old</li>
                        <li>• You provide fake credentials</li>
                        <li>• You intend to scam others</li>
                        <li>• You post fake reviews</li>
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                num: '3',
                title: 'Payments — Most Important',
                content: (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
                    <p className="font-heading font-bold text-red-800">Payments happen directly between you and the consultant.</p>
                    <div className="space-y-2 text-red-700 text-sm">
                      <p>• VisaGate.pk does NOT collect, hold, or process any payments</p>
                      <p>• We cannot issue refunds — we never received your money</p>
                      <p>• Always keep your payment receipts for your own safety</p>
                      <p>• Do your own research before paying any consultant</p>
                    </div>
                  </div>
                )
              },
              {
                num: '4',
                title: 'What We Are NOT Responsible For',
                content: (
                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-navy text-white">
                          <th className="px-4 py-3 text-left font-heading">Not Our Responsibility</th>
                          <th className="px-4 py-3 text-left font-heading">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { item: 'Visa rejection or refusal', eg: 'Your visa is denied by the embassy' },
                          { item: 'Immigration issues or delays', eg: 'Background checks or interview failures' },
                          { item: 'Consultant quality or expertise', eg: 'Consultant gives wrong advice' },
                          { item: 'Lost or stolen payments', eg: 'Consultant takes money and disappears' },
                          { item: 'Any visa outcome or result', eg: 'Application success or failure' },
                        ].map(row => (
                          <tr key={row.item} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-red-600 font-medium">❌ {row.item}</td>
                            <td className="px-4 py-3 text-gray-500">{row.eg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                num: '5',
                title: 'Platform Rules',
                content: (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="font-heading font-bold text-navy text-sm mb-2">✅ You Must:</p>
                      {[
                        'Be honest and respectful at all times',
                        'Keep conversations on our platform',
                        'Report suspicious or fraudulent users',
                        'Update your profile when information changes',
                        'Verify consultant credentials before paying',
                      ].map(r => (
                        <div key={r} className="flex items-start gap-2 text-xs">
                          <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                          {r}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="font-heading font-bold text-navy text-sm mb-2">❌ You Must NOT:</p>
                      {[
                        'Post fake reviews or false success rates',
                        'Scam or defraud other users',
                        'Share fake credentials or documents',
                        'Use abusive language in chat',
                        'Post spam or unrelated advertisements',
                      ].map(r => (
                        <div key={r} className="flex items-start gap-2 text-xs">
                          <span className="text-red-500 shrink-0 mt-0.5">✗</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
              {
                num: '6',
                title: 'Consultant Verification',
                content: (
                  <div className="space-y-3">
                    <p>We verify consultants by checking government records. A verification badge is displayed only after successful verification.</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { badge: 'OEP', full: 'Bureau of Emigration License' },
                        { badge: 'NTN', full: 'Federal Board of Revenue' },
                        { badge: 'SECP', full: 'Securities Commission (if applicable)' },
                      ].map(v => (
                        <div key={v.badge} className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                          <p className="font-heading font-bold text-green-800 text-sm">{v.badge}</p>
                          <p className="text-green-700 text-xs mt-1">{v.full}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-red-600 font-medium text-xs">⚠️ Fake verification documents = permanent ban + legal action under PECA 2016</p>
                  </div>
                )
              },
              {
                num: '7',
                title: 'Account Suspension & Deletion',
                content: (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-heading font-bold text-navy text-sm mb-2">We may ban your account if:</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li>• You provide fake credentials</li>
                        <li>• You receive multiple user complaints</li>
                        <li>• You attempt fraud or scam</li>
                        <li>• You violate these terms</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-heading font-bold text-navy text-sm mb-2">If you delete your account:</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li>• Profile removed within 14 days</li>
                        <li>• Chat history deleted after 30 days</li>
                        <li>• Reviews may remain (anonymized)</li>
                        <li>• Go to: Settings → Delete Account</li>
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                num: '8',
                title: 'Fees — Currently Free',
                content: (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <p className="font-heading font-bold text-green-800 mb-2">🎉 VisaGate.pk is completely FREE during launch phase.</p>
                    <p className="text-green-700 text-sm">If we introduce premium features in the future, you will be notified at least 30 days in advance before any charges apply.</p>
                  </div>
                )
              },
              {
                num: '9',
                title: 'Limitation of Liability',
                content: (
                  <div className="space-y-3">
                    <p>To the maximum extent permitted by Pakistani law, Visagate.pk and Defaste (Pvt) Ltd are not liable for any visa rejection, money lost to consultants, consultant actions or advice, or immigration outcomes.</p>
                    <div className="bg-gray-100 rounded-xl p-4">
                      <p className="font-heading font-bold text-navy text-sm">Maximum Liability:</p>
                      <p className="text-gray-600 text-xs mt-1">If a court finds us legally responsible, our maximum liability is limited to <strong>PKR 5,000</strong> (approx. $18 USD).</p>
                    </div>
                  </div>
                )
              },
              {
                num: '10',
                title: 'Governing Law',
                content: <p>These Terms are governed by the laws of the <strong className="text-navy">Islamic Republic of Pakistan</strong>. Any legal disputes shall be handled by courts in Pakistan.</p>
              },
            ].map(section => (
              <div key={section.num}>
                <h3 className="font-heading font-bold text-navy text-base mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-navy-light rounded-lg flex items-center justify-center text-navy text-xs font-bold shrink-0">
                    {section.num}
                  </span>
                  {section.title}
                </h3>
                {section.content}
              </div>
            ))}
          </div>
        </div>

        {/* ── URDU SECTION ── */}
        <div id="ur-terms" className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-10 mb-8" dir="rtl">
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shrink-0">
              <span className="font-urdu font-bold text-white text-sm">اُر</span>
            </div>
            <div>
              <h2 className="font-urdu font-bold text-navy text-xl">سروس کی شرائط</h2>
              <p className="font-body text-gray-400 text-xs">Urdu Version — اردو نسخہ</p>
            </div>
          </div>

          <div className="space-y-6 font-urdu text-gray-700 text-base leading-loose">

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <p className="font-bold text-red-800 text-lg mb-3">⚠️ پہلے یہ پڑھیں</p>
              <ul className="space-y-2 text-red-700">
                <li>• VisaGate.pk صرف ایک ملاپ کا پلیٹ فارم ہے — ہم خود ویزا نہیں بناتے</li>
                <li>• ادائیگیاں براہ راست آپ اور کنسلٹنٹ کے درمیان ہوتی ہیں — ہم پیسے نہیں لیتے</li>
                <li>• ویزا رد ہونے، کنسلٹنٹ کے معیار یا امیگریشن کے نتائج کے لیے ہم ذمہ دار نہیں ہیں</li>
                <li>• جعلی اسناد یا فراڈ = مستقل پابندی + قانونی کارروائی (PECA 2016)</li>
              </ul>
            </div>

            {[
              {
                num: '۱',
                title: 'VisaGate.pk کیا ہے؟',
                content: <p>VisaGate.pk ایک مفت ڈیجیٹل پلیٹ فارم ہے جو پاکستان بھر میں ویزا متلاشیوں کو تصدیق شدہ ویزا کنسلٹنٹس سے ملاتا ہے۔ ہم ایک پلیٹ فارم ہیں — ویزا ایجنسی نہیں۔</p>
              },
              {
                num: '۲',
                title: 'ادائیگیاں — سب سے اہم',
                content: (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <p className="font-bold text-red-800 mb-3">ادائیگیاں براہ راست آپ اور کنسلٹنٹ کے درمیان ہوتی ہیں۔</p>
                    <ul className="space-y-2 text-red-700">
                      <li>• VisaGate.pk کوئی ادائیگی وصول، رکھ یا پروسیس نہیں کرتا</li>
                      <li>• ہم واپسی (refund) نہیں دے سکتے — کیونکہ ہم نے پیسے کبھی لیے ہی نہیں</li>
                      <li>• کسی کو بھی پیسے دینے سے پہلے اپنی تحقیق ضرور کریں</li>
                      <li>• اپنی ادائیگیوں کی رسیدیں محفوظ رکھیں</li>
                    </ul>
                  </div>
                )
              },
              {
                num: '۳',
                title: 'ہم کس چیز کے ذمہ دار نہیں ہیں',
                content: (
                  <ul className="space-y-2 mr-4">
                    {[
                      'ویزا رد یا مسترد ہونا',
                      'امیگریشن کے مسائل یا تاخیر',
                      'کنسلٹنٹ کا معیار یا مہارت',
                      'کنسلٹنٹ کا پیسے لے کر غائب ہو جانا',
                      'ویزا کا کوئی بھی نتیجہ',
                    ].map((item, i) => <li key={i}>❌ {item}</li>)}
                  </ul>
                )
              },
              {
                num: '۴',
                title: 'پلیٹ فارم کے قوانین',
                content: (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-navy mb-2">✅ آپ کو کرنا ہے:</p>
                      <ul className="space-y-1">
                        {['ایمانداری اور احترام سے پیش آئیں', 'بات چیت پلیٹ فارم پر رکھیں', 'مشکوک صارفین کی رپورٹ کریں', 'پیسے دینے سے پہلے تصدیق کریں'].map((r, i) => <li key={i}>• {r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-navy mb-2">❌ آپ کو نہیں کرنا:</p>
                      <ul className="space-y-1">
                        {['جھوٹے ریویوز لکھنا', 'دوسروں کو دھوکہ دینا', 'جعلی دستاویزات', 'گالی گلوج یا اسپام'].map((r, i) => <li key={i}>• {r}</li>)}
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                num: '۵',
                title: 'اکاؤنٹ معطل یا حذف کرنا',
                content: (
                  <ul className="space-y-2 mr-4">
                    <li>• جعلی اسناد دینے پر اکاؤنٹ فوری بند کیا جائے گا</li>
                    <li>• متعدد شکایات پر معطلی ہو سکتی ہے</li>
                    <li>• اپنا اکاؤنٹ حذف کرنے کے لیے: Settings → Delete Account</li>
                    <li>• پروفائل 14 دنوں میں ہٹا دی جائے گی</li>
                    <li>• چیٹ 30 دنوں میں حذف ہو جائے گی</li>
                  </ul>
                )
              },
              {
                num: '۶',
                title: 'فیس — ابھی مفت',
                content: (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <p className="font-bold text-green-800 mb-2">🎉 VisaGate.pk ابھی مکمل طور پر مفت ہے۔</p>
                    <p className="text-green-700">اگر مستقبل میں کوئی فیس متعارف کرائی گئی تو آپ کو کم از کم 30 دن پہلے مطلع کیا جائے گا۔</p>
                  </div>
                )
              },
              {
                num: '۷',
                title: 'زیادہ سے زیادہ ذمہ داری کی حد',
                content: <p>اگر عدالت ہمیں کسی بھی معاملے میں ذمہ دار پائے تو ہماری زیادہ سے زیادہ ذمہ داری <strong className="text-navy">PKR 5,000</strong> تک محدود ہے۔</p>
              },
              {
                num: '۸',
                title: 'رابطہ کریں',
                content: (
                  <div className="bg-navy rounded-2xl p-5 text-white">
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'کمپنی', value: 'Defaste (Pvt) Ltd' },
                        { label: 'NTN', value: 'I4****71-1' },
                        { label: 'ای میل', value: 'info@visagate.pk' },
                        { label: 'ویب سائٹ', value: 'www.visagate.pk' },
                      ].map(item => (
                        <div key={item.label}>
                          <p className="text-white/50 text-xs">{item.label}</p>
                          <p className="font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
            ].map(section => (
              <div key={section.num}>
                <h3 className="font-urdu font-bold text-navy text-lg mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-gold-light rounded-lg flex items-center justify-center text-gold text-sm font-bold shrink-0">
                    {section.num}
                  </span>
                  {section.title}
                </h3>
                {section.content}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/privacy-policy"
            className="font-heading font-bold text-navy border border-navy px-5 py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
            ← Read Privacy Policy
          </Link>
          <Link href="/contact"
            className="font-body text-gray-500 hover:text-navy transition-colors">
            Questions? Contact Us
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}