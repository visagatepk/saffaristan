import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — VisaGate.pk',
  description: 'How VisaGate.pk collects, uses and protects your personal information.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-14 text-center">
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-3">
            Privacy Policy
          </h1>
          <p className="font-urdu text-gold/80 text-xl mb-4">رازداری کی پالیسی</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-body text-white/50">
            <span>Effective Date: April 2026</span>
            <span>·</span>
            <span>Version: 1.0</span>
            <span>·</span>
            <span>Jurisdiction: Islamic Republic of Pakistan</span>
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

        {/* Language tabs indicator */}
        <div className="flex items-center gap-3 mb-8">
          <a href="#english" className="font-heading font-bold text-sm text-white bg-navy px-4 py-2 rounded-xl">
            English
          </a>
          <a href="#urdu" className="font-heading font-bold text-sm text-navy border border-navy px-4 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors">
            اردو
          </a>
        </div>

        {/* ── ENGLISH SECTION ── */}
        <div id="english" className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-10 mb-8">
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-white text-sm">EN</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-navy text-xl">Privacy Policy</h2>
              <p className="font-body text-gray-400 text-xs">English Version</p>
            </div>
          </div>

          <div className="space-y-8 font-body text-gray-600 text-sm leading-relaxed">

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="font-heading font-bold text-amber-800 text-sm mb-1">Our Commitment</p>
              <p className="text-amber-700 text-sm">VisaGate.pk is operated by Defaste (Pvt) Ltd. Your privacy is the foundation of our platform. We handle sensitive personal data — including immigration documents and identity information — with the highest responsibility. We act as the Data Controller under Pakistan's Personal Data Protection Bill (PDPB) 2023.</p>
            </div>

            {[
              {
                num: '1',
                title: 'What Information We Collect',
                content: (
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-navy mb-1">For All Users:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Full name, email address, phone number and city</li>
                        <li>• Profile photo (optional)</li>
                        <li>• Device information, IP address and browser type</li>
                        <li>• Messages sent through our internal chat system</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-navy mb-1">For Consultants Only:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Business name and office address</li>
                        <li>• OEP license number and SECP registration date</li>
                        <li>• NTN number and years of experience</li>
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                num: '2',
                title: 'How We Use Your Information',
                content: (
                  <ul className="space-y-2">
                    {[
                      'To create and manage your account',
                      'To connect visa seekers with verified consultants',
                      'To verify consultant credentials against government records',
                      'To detect and prevent fraud and scams on the platform',
                      'To improve platform features and user experience',
                      'To comply with Pakistani law and government requests',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-gold mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                    <li className="flex items-start gap-2 mt-3">
                      <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                      <span className="font-semibold text-navy">We do NOT sell your data. We do NOT use it for advertising.</span>
                    </li>
                  </ul>
                )
              },
              {
                num: '3',
                title: 'Who We Share Your Data With',
                content: (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { who: 'Other Users', why: 'When you contact a consultant, basic profile info is shared with them.' },
                        { who: 'Service Providers', why: 'We work with trusted third-party service providers to operate and maintain our platform. These providers are contractually obligated to protect your data and use it only for specified purposes.' },
                        { who: 'Legal Authorities', why: 'Only if required by Pakistani law, court order, or PECA 2016.' },
                        { who: 'Fraud Prevention', why: 'Relevant information may be shared with authorities if scams are detected.' },
                      ].map(item => (
                        <div key={item.who} className="bg-gray-50 rounded-xl p-4">
                          <p className="font-semibold text-navy text-sm mb-1">{item.who}</p>
                          <p className="text-xs text-gray-500">{item.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
              {
                num: '4',
                title: 'Your Rights Under PDPB 2023',
                content: (
                  <div className="space-y-2">
                    {[
                      { right: 'Right to Access', desc: 'Request a copy of all data we hold about you. We respond within 30 days.' },
                      { right: 'Right to Correction', desc: 'Update incorrect information like your phone number or city.' },
                      { right: 'Right to Erasure', desc: 'Delete your account. Records removed within 14 days. (Financial logs kept for legal compliance.)' },
                      { right: 'Right to Withdraw Consent', desc: 'Turn off notifications or data permissions anytime via your settings.' },
                    ].map(item => (
                      <div key={item.right} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="font-heading font-bold text-gold text-xs shrink-0 mt-0.5">→</span>
                        <div>
                          <p className="font-semibold text-navy text-sm">{item.right}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                    <div className="bg-navy-light rounded-xl p-4 mt-3">
                      <p className="font-semibold text-navy text-sm">To exercise your rights:</p>
                      <p className="text-xs text-gray-600 mt-1">Email <span className="font-semibold">info@visagate.pk</span> with subject: <em>"Data Subject Request"</em></p>
                    </div>
                  </div>
                )
              },
              {
                num: '5',
                title: 'Data Security',
                content: (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { title: 'Encryption', desc: 'AES-256 at rest · TLS 1.2+ in transit' },
                      { title: 'Access Control', desc: 'Role-based access · MFA for all admin staff' },
                      { title: 'Breach Response', desc: 'Users notified within 72 hours of any breach' },
                    ].map(item => (
                      <div key={item.title} className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <p className="font-heading font-bold text-green-800 text-sm mb-1">🔒 {item.title}</p>
                        <p className="font-body text-green-700 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                num: '6',
                title: 'Children\'s Privacy',
                content: <p>Our services are strictly for individuals aged <strong className="text-navy">18 and above</strong>. We do not knowingly collect data from minors. If discovered, such data is deleted immediately.</p>
              },
              {
                num: '7',
                title: 'Changes to This Policy',
                content: <p>We may update this policy periodically. If material changes are made, we will notify you via email or an in-app notification. Continued use of VisaGate.pk after notification means you accept the updated policy.</p>
              },
              {
                num: '8',
                title: 'Contact Us',
                content: (
                  <div className="bg-navy rounded-2xl p-5 text-white">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      {[
                        { label: 'Parent Company', value: 'Defaste (Pvt) Ltd' },
                        { label: 'NTN', value: 'I4****71-1' },
                        { label: 'Email', value: 'info@visagate.pk' },
                        { label: 'Website', value: 'www.visagate.pk' },
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
        <div id="urdu" className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-10 mb-8" dir="rtl">
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-white text-sm">اُر</span>
            </div>
            <div>
              <h2 className="font-urdu font-bold text-navy text-xl">رازداری کی پالیسی</h2>
              <p className="font-body text-gray-400 text-xs">Urdu Version — اردو نسخہ</p>
            </div>
          </div>

          <div className="space-y-6 font-urdu text-gray-700 text-base leading-loose">

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="font-bold text-amber-800 mb-2">ہماری ذمہ داری</p>
              <p className="text-amber-700">VisaGate.pk کو Defaste (Pvt) Ltd چلاتی ہے۔ آپ کی رازداری ہمارے پلیٹ فارم کی بنیاد ہے۔ ہم پاکستان کے پرسنل ڈیٹا پروٹیکشن بل (PDPB) 2023 کے تحت ڈیٹا کنٹرولر کے طور پر کام کرتے ہیں۔</p>
            </div>

            {[
              {
                num: '۱',
                title: 'ہم کیا معلومات جمع کرتے ہیں',
                content: (
                  <ul className="space-y-2 mr-4">
                    <li>• تمام صارفین سے: نام، ای میل، فون نمبر، شہر اور پروفائل تصویر</li>
                    <li>• کنسلٹنٹس سے: کاروباری نام، OEP لائسنس نمبر، NTN نمبر اور تجربے کے سال</li>
                    <li>• خودکار طور پر: آئی پی ایڈریس، ڈیوائس کی معلومات اور سائٹ استعمال</li>
                    <li>• چیٹ کے پیغامات (صرف پلیٹ فارم کی سیکیورٹی کے لیے)</li>
                  </ul>
                )
              },
              {
                num: '۲',
                title: 'ہم آپ کی معلومات کیسے استعمال کرتے ہیں',
                content: (
                  <ul className="space-y-2 mr-4">
                    {[
                      'اکاؤنٹ بنانے اور منظم کرنے کے لیے',
                      'ویزا متلاشیوں کو تصدیق شدہ کنسلٹنٹس سے ملانے کے لیے',
                      'کنسلٹنٹ کی اسناد کی حکومتی ریکارڈ سے تصدیق کے لیے',
                      'فراڈ اور دھوکہ دہی سے بچاؤ کے لیے',
                      'پاکستانی قانون کی تعمیل کے لیے',
                      'ہم آپ کا ڈیٹا فروخت نہیں کرتے۔ ہم اشتہارات کے لیے استعمال نہیں کرتے۔',
                    ].map((item, i) => <li key={i}>✓ {item}</li>)}
                  </ul>
                )
              },
              {
                num: '۳',
                title: 'آپ کے حقوق (PDPB 2023)',
                content: (
                  <ul className="space-y-2 mr-4">
                    <li>• <strong>رسائی کا حق:</strong> آپ اپنے ڈیٹا کی کاپی مانگ سکتے ہیں (30 دنوں میں جواب)</li>
                    <li>• <strong>اصلاح کا حق:</strong> غلط معلومات کو درست کروا سکتے ہیں</li>
                    <li>• <strong>حذف کا حق:</strong> اکاؤنٹ 14 دنوں میں ختم کیا جائے گا</li>
                    <li>• <strong>رضامندی واپس لینے کا حق:</strong> کسی بھی وقت نوٹیفیکیشن بند کر سکتے ہیں</li>
                    <li className="bg-navy-light rounded-xl p-3 mt-2">اپنے حقوق کے لیے ای میل کریں: <strong className="text-navy">info@visagate.pk</strong></li>
                  </ul>
                )
              },
              {
                num: '۴',
                title: 'ڈیٹا کی سیکیورٹی',
                content: (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { title: '🔒 انکرپشن', desc: 'ڈیٹا محفوظ طریقے سے انکرپٹ کیا جاتا ہے' },
                      { title: '👤 رسائی کنٹرول', desc: 'صرف مجاز عملہ ڈیٹا تک رسائی حاصل کر سکتا ہے' },
                      { title: '⚡ خلاف ورزی کا جواب', desc: '72 گھنٹوں میں صارفین کو مطلع کیا جائے گا' },
                    ].map(item => (
                      <div key={item.title} className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <p className="font-bold text-green-800 text-sm mb-1">{item.title}</p>
                        <p className="text-green-700 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                num: '۵',
                title: 'بچوں کی رازداری',
                content: <p>ہماری خدمات صرف <strong className="text-navy">18 سال اور اس سے زیادہ</strong> عمر کے افراد کے لیے ہیں۔ نابالغوں کا ڈیٹا فوری حذف کر دیا جائے گا۔</p>
              },
              {
                num: '۶',
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

        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/terms-of-service"
            className="font-heading font-bold text-navy border border-navy px-5 py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
            Read Terms of Service →
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