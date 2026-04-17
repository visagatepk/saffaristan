import Link from 'next/link'
import Image from 'next/image'
import { Search, Briefcase, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      {/* Logo */}
      <Link href="/" className="mb-12">
        <Image src="/logo.png" alt="VisaGate.pk" width={160} height={40} className="h-10 w-auto" />
      </Link>

      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-navy text-3xl mb-2">
          Create your account
        </h1>
        <p className="font-urdu text-gold text-base mb-2">اپنا اکاؤنٹ بنائیں</p>
        <p className="font-body text-gray-500 text-sm">
          Choose how you want to use VisaGate.pk
        </p>
      </div>

      {/* Role cards */}
      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">

        {/* Seeker */}
        <Link
          href="/register/seeker"
          className="group bg-white border border-gray-100 hover:border-navy/30 hover:shadow-md rounded-2xl p-8 transition-all text-center"
        >
          <div className="w-16 h-16 bg-navy-light rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-navy transition-colors">
            <Search size={28} className="text-navy group-hover:text-white transition-colors" />
          </div>
          <h2 className="font-heading font-bold text-navy text-xl mb-2">
            I'm a Visa Seeker
          </h2>
          <p className="font-urdu text-gold text-sm mb-3">
            میں ویزا تلاش کر رہا ہوں
          </p>
          <p className="font-body text-gray-500 text-sm leading-relaxed mb-6">
            Find and connect with verified visa consultants across Pakistan
          </p>
          <div className="font-heading text-sm font-semibold text-navy group-hover:text-gold transition-colors flex items-center justify-center gap-1">
            Get Started Free
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Consultant */}
        <Link
          href="/register/consultant"
          className="group bg-navy border border-navy hover:bg-navy-dark rounded-2xl p-8 transition-all text-center"
        >
          <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Briefcase size={28} className="text-gold" />
          </div>
          <h2 className="font-heading font-bold text-white text-xl mb-2">
            I'm a Consultant
          </h2>
          <p className="font-urdu text-gold/80 text-sm mb-3">
            میں ویزا کنسلٹنٹ ہوں
          </p>
          <p className="font-body text-white/60 text-sm leading-relaxed mb-6">
            List your agency and connect with thousands of visa seekers
          </p>
          <div className="font-heading text-sm font-semibold text-gold flex items-center justify-center gap-1">
            List Your Agency Free
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* Login link */}
      <p className="font-body text-sm text-gray-500 mt-8">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-navy hover:text-gold transition-colors">
          Sign in
        </Link>
      </p>

    </div>
  )
}