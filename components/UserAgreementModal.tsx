'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, CheckCircle } from 'lucide-react'

interface Props {
  onAccept: () => void
  onDecline: () => void
}

export default function UserAgreementModal({ onAccept, onDecline }: Props) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDecline} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-navy rounded-t-3xl px-6 pt-6 pb-5 relative">
          <button onClick={onDecline}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
            <X size={14} />
          </button>
          <div className="text-center">
            <h2 className="font-heading font-bold text-white text-lg">
              VISAGATE.PK USER AGREEMENT
            </h2>
            <p className="font-urdu text-gold text-base mt-1">صارف معاہدہ</p>
            <p className="font-body text-white/40 text-xs mt-2">
              Defaste (Pvt) Ltd · NTN: I489871-1
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-3">

          {/* Card 1 — Payments */}
          <div className="border-2 border-red-200 rounded-2xl overflow-hidden">
            <div className="bg-red-500 px-4 py-2">
              <span className="font-heading font-bold text-white text-xs tracking-wide">🔴 PAYMENTS</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="font-body text-sm font-semibold text-gray-800 leading-relaxed">
                  Payments happen <span className="text-red-600 font-bold">DIRECTLY</span> between you and the consultant. We do <span className="text-red-600 font-bold">NOT</span> handle or guarantee any payments.
                </p>
              </div>
              <div className="border-t border-red-100 pt-3">
                <p className="font-urdu text-sm text-gray-700 leading-loose" dir="rtl">
                  ادائیگیاں براہ راست آپ اور کنسلٹنٹ کے درمیان ہوتی ہیں۔ ہم ادائیگیوں کی کوئی ذمہ داری نہیں لیتے۔
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 — Not Responsible */}
          <div className="border-2 border-red-200 rounded-2xl overflow-hidden">
            <div className="bg-red-500 px-4 py-2">
              <span className="font-heading font-bold text-white text-xs tracking-wide">🔴 NOT RESPONSIBLE FOR</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="font-body text-sm font-semibold text-gray-800 mb-2">We are <span className="text-red-600 font-bold">NOT</span> responsible for:</p>
                <ul className="space-y-1 font-body text-sm text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-red-500">•</span> Visa rejection or refusal</li>
                  <li className="flex items-center gap-2"><span className="text-red-500">•</span> Immigration issues</li>
                  <li className="flex items-center gap-2"><span className="text-red-500">•</span> Consultant quality or expertise</li>
                </ul>
              </div>
              <div className="border-t border-red-100 pt-3">
                <p className="font-urdu text-sm text-gray-700 mb-2 leading-loose" dir="rtl">ہم ذمہ دار نہیں ہیں:</p>
                <ul className="space-y-1 font-urdu text-sm text-gray-600" dir="rtl">
                  <li>• ویزا رد یا مسترد ہونے پر</li>
                  <li>• امیگریشن مسائل پر</li>
                  <li>• کنسلٹنٹ کے معیار یا مہارت پر</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3 — Own Risk */}
          <div className="border-2 border-amber-200 rounded-2xl overflow-hidden">
            <div className="bg-amber-400 px-4 py-2">
              <span className="font-heading font-bold text-white text-xs tracking-wide">⚠️ YOUR RESPONSIBILITY</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="font-body text-sm font-semibold text-gray-800">
                You use this platform <span className="text-amber-600 font-bold">at your own risk</span>. Do your own research before paying anyone.
              </p>
              <div className="border-t border-amber-100 pt-3">
                <p className="font-urdu text-sm text-gray-700 leading-loose" dir="rtl">
                  آپ یہ پلیٹ فارم اپنی ذمہ داری پر استعمال کریں۔ کسی کو پیسے دینے سے پہلے خود تحقیق کریں۔
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 — No Fraud */}
          <div className="border-2 border-green-200 rounded-2xl overflow-hidden">
            <div className="bg-green-500 px-4 py-2">
              <span className="font-heading font-bold text-white text-xs tracking-wide">✅ STRICT RULE</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="font-body text-sm font-semibold text-gray-800">
                Fake credentials or scams = <span className="text-red-600 font-bold">Permanent Ban + Legal Action</span> under PECA 2016.
              </p>
              <div className="border-t border-green-100 pt-3">
                <p className="font-urdu text-sm text-gray-700 leading-loose" dir="rtl">
                  جعلی اسناد یا فراڈ = مستقل پابندی + قانونی کارروائی (PECA 2016)
                </p>
              </div>
            </div>
          </div>

          {/* Read Full links */}
          <div className="flex items-center justify-center gap-4 py-1">
            <Link href="/terms-of-service" target="_blank"
              className="font-body text-xs text-navy hover:underline flex items-center gap-1">
              READ FULL / مکمل پڑھیں →
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy-policy" target="_blank"
              className="font-body text-xs text-navy hover:underline">
              Privacy Policy
            </Link>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-navy/40 transition-colors">
            <div
              onClick={() => setChecked(!checked)}
              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                checked ? 'bg-navy border-navy' : 'border-gray-300 bg-white'
              }`}>
              {checked && <CheckCircle size={13} className="text-white" />}
            </div>
            <div>
              <p className="font-body text-sm text-gray-700 font-semibold">
                I have read and understood this User Agreement
              </p>
              <p className="font-urdu text-sm text-gray-500 mt-1 leading-loose" dir="rtl">
                میں نے یہ صارف معاہدہ پڑھ لیا ہے اور سمجھ گیا/گئی ہوں
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 space-y-3">
          <div className="flex gap-3">
            <button onClick={onDecline}
              className="flex-1 font-heading font-bold text-sm text-gray-500 border-2 border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Decline
            </button>
            <button
              onClick={() => { if (checked) onAccept() }}
              disabled={!checked}
              className={`flex-1 font-heading font-bold text-sm text-white py-3 rounded-xl transition-all ${
                checked ? 'hover:opacity-90 active:scale-[0.98]' : 'opacity-40 cursor-not-allowed'
              }`}
              style={{ background: checked ? 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' : '#9ca3af' }}>
              I AGREE / میں متفق ہوں ✓
            </button>
          </div>
          <p className="font-body text-xs text-gray-400 text-center leading-relaxed">
            By clicking I AGREE, you accept our User Agreement
            <br />
            <span className="font-urdu">میں متفق ہوں پر کلک کرکے، آپ صارف معاہدہ قبول کرتے ہیں</span>
          </p>
        </div>
      </div>
    </div>
  )
}