'use client'
// components/how-it-works/VideoLibrary.tsx

import { useState } from 'react'
import { Play, Clock } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types — defined inline so this file has zero external dependencies
// until data/videos.ts exists. Once created, switch to the import below.
// ─────────────────────────────────────────────────────────────────────────────
// import { VIDEOS, Video, VideoCategory } from '@/data/videos'

export type VideoCategory = 'Platform' | 'For Seekers' | 'For Consultants' | 'Scholarship'

export interface Video {
  id: string
  category: VideoCategory
  duration: string
  title: string
  description: string
  youtubeId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Video data — inline until data/videos.ts is ready.
// When data/videos.ts is created: delete VIDEOS below and uncomment the import.
// ─────────────────────────────────────────────────────────────────────────────
const VIDEOS: Video[] = [
  { id: 'v1', category: 'Platform',        duration: '3:20', title: 'Welcome to VisaGate.pk',                description: "A full introduction to Pakistan's first verified visa consultant platform — what it is, how it works, and why it was built.", youtubeId: undefined },
  { id: 'v2', category: 'For Seekers',     duration: '4:15', title: 'How to Sign Up as a Seeker',            description: 'Step-by-step walkthrough of creating your seeker account, setting up your profile, and finding the right visa consultant.', youtubeId: undefined },
  { id: 'v3', category: 'For Seekers',     duration: '5:00', title: 'How to Find & Book a Consultant',       description: 'Learn how to search, filter, read profiles, and book an appointment with a verified consultant in minutes.', youtubeId: undefined },
  { id: 'v4', category: 'For Consultants', duration: '6:30', title: 'How to Register as a Consultant',       description: 'Complete guide for visa consultants — create your profile, list your services, and get your verification badge.', youtubeId: undefined },
  { id: 'v5', category: 'For Consultants', duration: '7:00', title: 'Managing Your Consultant Dashboard',    description: 'Tour of the consultant dashboard — appointments, messaging, analytics, and managing your service listings.', youtubeId: undefined },
  { id: 'v6', category: 'Scholarship',     duration: '8:45', title: 'UK Scholarships for Pakistanis 2025',   description: 'Complete guide to Chevening, Commonwealth, and UK university scholarships available for Pakistani students.', youtubeId: undefined },
  { id: 'v7', category: 'Scholarship',     duration: '9:10', title: 'Canada Study Permit & Scholarships',    description: 'How to apply for a Canadian study permit and a breakdown of scholarships available for Pakistani applicants.', youtubeId: undefined },
  { id: 'v8', category: 'Scholarship',     duration: '7:55', title: 'Australia & New Zealand Scholarships',  description: 'Australia Awards and New Zealand ASEAN scholarships — eligibility, how to apply, and tips for Pakistani applicants.', youtubeId: undefined },
]

// ─────────────────────────────────────────────────────────────────────────────
// Inline YouTube SVG icon (lucide-react has no Youtube icon)
// ─────────────────────────────────────────────────────────────────────────────
function YouTubeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Category styles
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<VideoCategory, string> = {
  'Platform':        'bg-blue-100 text-blue-700',
  'For Seekers':     'bg-purple-100 text-purple-700',
  'For Consultants': 'bg-[#1B3060]/10 text-[#1B3060]',
  'Scholarship':     'bg-green-100 text-green-700',
}

type FilterTab = 'All' | VideoCategory

const FILTER_TABS: FilterTab[] = [
  'All', 'Platform', 'For Seekers', 'For Consultants', 'Scholarship',
]

// ─────────────────────────────────────────────────────────────────────────────
// VideoCard
// ─────────────────────────────────────────────────────────────────────────────
function VideoCard({ video }: { video: Video }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const thumbnailUrl = video.youtubeId
    ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col">

      {/* Video area */}
      <div className="relative h-48 bg-[#1B3060] overflow-hidden">

        {isPlaying && video.youtubeId ? (
          // Embedded YouTube player
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />

        ) : thumbnailUrl ? (
          // YouTube thumbnail with play button overlay
          <button
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative group/thumb focus:outline-none"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 group-hover/thumb:bg-red-700 rounded-full flex items-center justify-center shadow-xl transition-all group-hover/thumb:scale-110">
                <Play size={24} className="text-white ml-1.5" fill="white" />
              </div>
            </div>
            <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg">
              <Clock size={10} /> {video.duration}
            </span>
          </button>

        ) : (
          // "Video coming soon" placeholder
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <YouTubeIcon size={36} className="text-white/20" />
            <span className="text-white/40 text-xs font-body">Video coming soon</span>
            <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 text-white/50 text-xs font-medium px-2 py-1 rounded-lg">
              <Clock size={10} /> {video.duration}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <span className={`inline-flex self-start text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${CATEGORY_STYLES[video.category]}`}>
          {video.category}
        </span>

        <h3 className="font-heading font-bold text-[#1B3060] text-base leading-snug mb-2">
          {video.title}
        </h3>

        <p className="font-body text-gray-500 text-sm leading-relaxed line-clamp-2">
          {video.description}
        </p>

        {video.youtubeId && !isPlaying && (
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <YouTubeIcon size={13} /> Watch on YouTube
          </a>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VideoLibrary
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  initialCategory?: FilterTab
  hideFilters?: boolean
}

export default function VideoLibrary({
  initialCategory = 'All',
  hideFilters = false,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>(initialCategory)

  const filtered: Video[] = activeFilter === 'All'
    ? VIDEOS
    : VIDEOS.filter((v: Video) => v.category === activeFilter)

  const countFor = (tab: FilterTab): number =>
    tab === 'All' ? VIDEOS.length : VIDEOS.filter((v: Video) => v.category === tab).length

  return (
    <div>
      {!hideFilters && (
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_TABS.map((tab: FilterTab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFilter === tab
                  ? 'bg-[#1B3060] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B3060]/30 hover:text-[#1B3060]'
              }`}
            >
              {tab}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                activeFilter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {countFor(tab)}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" key={activeFilter}>
        {filtered.map((video: Video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}