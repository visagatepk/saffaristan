// data/videos.ts

export type VideoCategory = 'Platform' | 'For Seekers' | 'For Consultants' | 'Scholarship'

export interface Video {
  id: string
  category: VideoCategory
  duration: string
  title: string
  description: string
  // Paste the YouTube video ID here (the part after ?v= in the URL)
  // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ → youtubeId: 'dQw4w9WgXcQ'
  // Leave undefined to show "Video coming soon" placeholder
  youtubeId?: string
}

export const VIDEOS: Video[] = [
  {
    id: 'v1',
    category: 'Platform',
    duration: '3:20',
    title: 'Welcome to VisaGate.pk',
    description: "A full introduction to Pakistan's first verified visa consultant platform — what it is, how it works, and why it was built.",
    youtubeId: undefined, // e.g. 'abc123xyz'
  },
  {
    id: 'v2',
    category: 'For Seekers',
    duration: '4:15',
    title: 'How to Sign Up as a Seeker',
    description: 'Step-by-step walkthrough of creating your seeker account, setting up your profile, and finding the right visa consultant.',
    youtubeId: undefined,
  },
  {
    id: 'v3',
    category: 'For Seekers',
    duration: '5:00',
    title: 'How to Find & Book a Consultant',
    description: 'Learn how to search, filter, read profiles, and book an appointment with a verified consultant in minutes.',
    youtubeId: undefined,
  },
  {
    id: 'v4',
    category: 'For Consultants',
    duration: '6:30',
    title: 'How to Register as a Consultant',
    description: 'Complete guide for visa consultants — create your profile, list your services, and get your verification badge.',
    youtubeId: undefined,
  },
  {
    id: 'v5',
    category: 'For Consultants',
    duration: '7:00',
    title: 'Managing Your Consultant Dashboard',
    description: 'Tour of the consultant dashboard — appointments, messaging, analytics, and managing your service listings.',
    youtubeId: undefined,
  },
  {
    id: 'v6',
    category: 'Scholarship',
    duration: '8:45',
    title: 'UK Scholarships for Pakistanis 2025',
    description: 'Complete guide to Chevening, Commonwealth, and UK university scholarships available for Pakistani students.',
    youtubeId: undefined,
  },
  {
    id: 'v7',
    category: 'Scholarship',
    duration: '9:10',
    title: 'Canada Study Permit & Scholarships',
    description: 'How to apply for a Canadian study permit and a breakdown of scholarships available for Pakistani applicants.',
    youtubeId: undefined,
  },
  {
    id: 'v8',
    category: 'Scholarship',
    duration: '7:55',
    title: 'Australia & New Zealand Scholarships',
    description: 'Australia Awards and New Zealand ASEAN scholarships — eligibility, how to apply, and tips for Pakistani applicants.',
    youtubeId: undefined,
  },
]