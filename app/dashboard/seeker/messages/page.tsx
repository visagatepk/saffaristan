import { MessageSquare } from 'lucide-react'

export default function SeekerMessages() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-2xl">
      <MessageSquare size={40} className="text-gray-200 mx-auto mb-4" />
      <h2 className="font-heading font-bold text-navy text-xl mb-2">Messages</h2>
      <p className="font-body text-gray-500 text-sm max-w-xs mx-auto">
        Your conversations with visa consultants will appear here. Coming soon.
      </p>
    </div>
  )
}