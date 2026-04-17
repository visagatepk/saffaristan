import { CalendarCheck } from 'lucide-react'

export default function BookingsPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-2xl">
      <CalendarCheck size={40} className="text-gray-200 mx-auto mb-4" />
      <h2 className="font-heading font-bold text-navy text-xl mb-2">Bookings</h2>
      <p className="font-body text-gray-500 text-sm">
        When visa seekers book consultations with you, they will appear here.
      </p>
    </div>
  )
}