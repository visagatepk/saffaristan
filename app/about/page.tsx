
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  Shield, Users, Star, Globe,
  CheckCircle, ArrowRight, Heart,
  TrendingUp, Zap, Lock
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About VisaGate.pk — Pakistan\'s First Verified Visa Platform',
  description: 'Learn how VisaGate.pk verifies visa consultants against OEP, SECP and FBR records. Our mission, values and verification process explained.',
  alternates: { canonical: 'https://visagate.pk/about' },
  openGraph: {
    title: 'About VisaGate.pk — Pakistan\'s First Verified Visa Platform',
    description: 'Learn how VisaGate.pk verifies visa consultants against OEP, SECP and FBR records.',
    url: 'https://visagate.pk/about',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'About VisaGate.pk' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About VisaGate.pk — Pakistan\'s First Verified Visa Platform',
    description: 'Learn how VisaGate.pk verifies visa consultants against OEP, SECP and FBR records.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-6">
            <Heart size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">Our Story</span>
          </div>
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl mb-4 leading-tight">
            About VisaGate.pk
          </h1>
          <p className="font-urdu text-gold/80 text-xl mb-5">ہمارے بارے میں</p>
          <p className="font-body text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Pakistan's first platform connecting visa seekers with verified, licensed immigration consultants — built on trust, transparency and real results.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14 space-y-14">

        {/* ── Our Story ── */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-10 lg:p-12">
              <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
                Our Story
              </span>
              <h2 className="font-heading font-bold text-navy text-2xl lg:text-3xl mt-5 mb-4 leading-snug">
                Why We Built VisaGate.pk
              </h2>
              <p className="font-urdu text-gold text-base mb-5">ہم نے یہ کیوں بنایا</p>
              <div className="space-y-4 font-body text-gray-600 text-sm leading-relaxed">
                <p>
                  Every year, thousands of Pakistanis fall victim to fake visa consultants — losing their savings, their dreams, and sometimes years of their lives. We saw this problem firsthand and decided to do something about it.
                </p>
                <p>
                  VisaGate.pk was founded with one mission: <strong className="text-navy">make the visa process safe, transparent and accessible</strong> for every Pakistani — whether they are in Islamabad, Karachi, or a small town in Punjab.
                </p>
                <p>
                  We built Pakistan's first classified marketplace where every consultant is verified against government records (OEP, SECP, FBR) before they can list their services. No more guessing. No more fraud.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-navy p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
              <div className="relative">
                <p className="font-heading font-bold text-white text-lg mb-6">
                  VisaGate by the Numbers
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { num: '300+', label: 'Active Consultants', icon: Users },
                    { num: '7+', label: 'Seekers Registered', icon: Heart },
                    { num: '30+', label: 'Countries Covered', icon: Globe },
                    { num: '4.8★', label: 'Average Rating', icon: Star },
                    { num: '100%', label: 'Verified Listings', icon: Shield },
                    { num: 'Free', label: 'To Join & Browse', icon: CheckCircle },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <stat.icon size={14} className="text-gold shrink-0" />
                        <span className="font-heading font-extrabold text-gold text-xl">{stat.num}</span>
                      </div>
                      <p className="font-body text-white/50 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mission & Vision ── */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="w-12 h-12 bg-navy-light rounded-2xl flex items-center justify-center mb-5">
              <Shield size={22} className="text-navy" />
            </div>
            <h3 className="font-heading font-bold text-navy text-xl mb-2">Our Mission</h3>
            <p className="font-urdu text-gold text-sm mb-4">ہمارا مشن</p>
            <p className="font-body text-gray-600 text-sm leading-relaxed">
              To eliminate visa fraud in Pakistan by making consultant verification mandatory, transparent and publicly accessible — so every Pakistani can start their visa journey with confidence.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="w-12 h-12 bg-gold-light rounded-2xl flex items-center justify-center mb-5">
              <TrendingUp size={22} className="text-gold" />
            </div>
            <h3 className="font-heading font-bold text-navy text-xl mb-2">Our Vision</h3>
            <p className="font-urdu text-gold text-sm mb-4">ہمارا وژن</p>
            <p className="font-body text-gray-600 text-sm leading-relaxed">
              To become Pakistan's most trusted immigration technology platform — where every visa seeker finds the right consultant in minutes, and every honest consultant grows their business with ease.
            </p>
          </div>
        </div>

        {/* ── Values ── */}
        <div>
          <div className="text-center mb-10">
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
              What We Stand For
            </span>
            <h2 className="font-heading font-bold text-navy text-2xl lg:text-3xl mt-5 mb-2">
              Our Core Values
            </h2>
            <p className="font-urdu text-gold text-lg">ہماری اقدار</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Shield,
                title: 'Trust First',
                urdu: 'اعتماد سب سے پہلے',
                desc: 'Every consultant is verified against government records before listing. No exceptions.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Transparency',
                urdu: 'شفافیت',
                desc: 'Clear pricing, honest reviews, and open verification status — no hidden surprises.',
                color: 'text-gold',
                bg: 'bg-gold-light',
              },
              {
                icon: Heart,
                title: 'People First',
                urdu: 'لوگ پہلے',
                desc: 'Built for Pakistanis, by Pakistanis. We understand the struggles and solve them.',
                color: 'text-red-500',
                bg: 'bg-red-50',
              },
              {
                icon: Lock,
                title: 'Security',
                urdu: 'سیکیورٹی',
                desc: 'Your data is encrypted and protected. We follow Pakistan\'s PDPB 2023 standards.',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
            ].map(v => (
              <div key={v.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group text-center">
                <div className={`w-12 h-12 ${v.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform`}>
                  <v.icon size={20} className={v.color} />
                </div>
                <h3 className="font-heading font-bold text-navy text-base mb-1">{v.title}</h3>
                <p className="font-urdu text-gold text-xs mb-3">{v.urdu}</p>
                <p className="font-body text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How We Verify ── */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-12">
          <div className="text-center mb-10">
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
              Our Process
            </span>
            <h2 className="font-heading font-bold text-navy text-2xl lg:text-3xl mt-5 mb-2">
              How We Verify Consultants
            </h2>
            <p className="font-urdu text-gold text-lg mb-3">ہم کنسلٹنٹس کی تصدیق کیسے کرتے ہیں</p>
            <p className="font-body text-gray-500 text-sm max-w-xl mx-auto">
              Every consultant on VisaGate.pk goes through a strict verification process before they can list their services.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Application',
                urdu: 'درخواست',
                desc: 'Consultant submits their OEP license number, NTN and business details.',
                icon: '📋',
              },
              {
                step: '02',
                title: 'Verification',
                urdu: 'تصدیق',
                desc: 'Our team cross-checks credentials against OEP, FBR and SECP government records.',
                icon: '🔍',
              },
              {
                step: '03',
                title: 'Approval',
                urdu: 'منظوری',
                desc: 'Verified consultants receive a green badge and can start listing their services.',
                icon: '✅',
              },
              {
                step: '04',
                title: 'Monitoring',
                urdu: 'نگرانی',
                desc: 'We monitor reviews and complaints. Any fraud results in immediate suspension.',
                icon: '👁️',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="bg-gray-50 rounded-2xl p-5 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-heading font-extrabold text-navy/20 text-2xl">{item.step}</span>
                  </div>
                  <h3 className="font-heading font-bold text-navy text-base mb-1">{item.title}</h3>
                  <p className="font-urdu text-gold text-xs mb-2">{item.urdu}</p>
                  <p className="font-body text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 bg-gold rounded-full items-center justify-center shrink-0">
                    <ArrowRight size={12} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center">
          <h2 className="font-heading font-bold text-navy text-2xl mb-3">
            Ready to Start Your Visa Journey?
          </h2>
          <p className="font-urdu text-gold text-lg mb-6">اپنا ویزا سفر شروع کریں</p>
          <p className="font-body text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Browse verified consultants, read reviews and connect with the right expert — all for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultants"
              className="font-heading font-bold text-sm text-white px-8 py-3.5 rounded-xl hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              Find a Consultant →
            </Link>
            <Link href="/register/consultant"
              className="font-heading font-bold text-sm text-navy border-2 border-navy px-8 py-3.5 rounded-xl hover:bg-navy hover:text-white transition-all">
              List Your Services
            </Link>
            <Link href="/contact"
              className="font-heading font-bold text-sm text-gray-500 border-2 border-gray-200 px-8 py-3.5 rounded-xl hover:border-navy hover:text-navy transition-all">
              Contact Us
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}