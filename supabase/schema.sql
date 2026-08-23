-- =========================================================
-- MyTechFlow Labs (mytechflowlabs.com) Supabase Database Schema
-- Run this in your Supabase Project's SQL Editor
-- =========================================================

-- 1. Create the apps table
CREATE TABLE IF NOT EXISTS public.apps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Tools',
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Live',
    featured BOOLEAN NOT NULL DEFAULT false,
    accent_color TEXT DEFAULT '#06b6d4',
    gradient TEXT DEFAULT 'from-cyan-500 via-blue-600 to-indigo-600',
    icon TEXT DEFAULT 'AppWindow',
    screenshot_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    stats JSONB DEFAULT '{"users": "1k+", "rating": "4.9/5", "version": "v1.0"}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public can read all apps
CREATE POLICY "Allow public read-only access to apps"
ON public.apps
FOR SELECT
TO public
USING (true);

-- 4. Policy: Only Admin (nrkb1998@gmail.com) can insert new apps
CREATE POLICY "Allow admin insert"
ON public.apps
FOR INSERT
TO authenticated
WITH CHECK (
    auth.jwt() ->> 'email' = 'nrkb1998@gmail.com'
);

-- 5. Policy: Only Admin (nrkb1998@gmail.com) can update existing apps
CREATE POLICY "Allow admin update"
ON public.apps
FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'nrkb1998@gmail.com'
)
WITH CHECK (
    auth.jwt() ->> 'email' = 'nrkb1998@gmail.com'
);

-- 6. Policy: Only Admin (nrkb1998@gmail.com) can delete apps
CREATE POLICY "Allow admin delete"
ON public.apps
FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'nrkb1998@gmail.com'
);

-- 7. Seed Initial Apps Data
INSERT INTO public.apps (id, title, tagline, description, category, url, status, featured, accent_color, gradient, icon, screenshot_url, tags, features, stats)
VALUES 
(
  'app-french-learner',
  'French Learner AI',
  'Interactive French Mastery with Spaced Repetition & Real-time AI Audio',
  'An immersive language acquisition platform tailored for accelerated French fluency. Features intelligent voice dialogue drills, CEFR grammar breakdown (A1 to C2), smart flashcards, conjugation engines, and real-time pronunciation feedback.',
  'Education',
  'https://french-learner.mytechflowlabs.com',
  'Live',
  true,
  '#3b82f6',
  'from-blue-600 via-indigo-600 to-cyan-500',
  'BookOpen',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  ARRAY['React', 'Web Speech API', 'Tailwind', 'AI Voice', 'Spaced Repetition'],
  ARRAY['Interactive Speech-to-Text & Pronunciation Evaluator', 'CEFR-aligned vocabulary decks with audio playback', 'Dynamic conjugation engine with 1,000+ verbs', 'Daily streak tracking & gamified leaderboard'],
  '{"users": "3.4k+", "rating": "4.9/5", "version": "v2.4"}'::JSONB
),
(
  'app-timelog-pro',
  'TimeLog Pro',
  'Precision Productivity Tracker & Client Billable Analytics Suite',
  'A powerful, sleek time tracking and work log intelligence suite for engineers and freelancers. Seamlessly record active focus blocks, manage multi-tier projects, calculate billable earnings in real-time, and generate comprehensive timesheets.',
  'Productivity',
  'https://timelog.mytechflowlabs.com',
  'Live',
  true,
  '#10b981',
  'from-emerald-600 via-teal-600 to-cyan-500',
  'Clock',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  ARRAY['React', 'Chart.js', 'Supabase', 'Export CSV/PDF', 'Pomodoro'],
  ARRAY['Smart Pomodoro & continuous stopwatch with idle detect', 'Multi-currency billable rate calculator', 'Interactive timesheet heatmaps & productivity analytics', 'Automated one-click invoice & CSV report export'],
  '{"users": "5.1k+", "rating": "4.95/5", "version": "v3.1"}'::JSONB
),
(
  'app-tcf-suite',
  'TCF Preparation Suite',
  'Official TCF Exam Simulator with Timed Listening & Auto-Scoring',
  'A specialized testing environment engineered for candidates taking the Test de Connaissance du Français (TCF Canada / TCF TP). Includes full-length timed mock tests, listening comprehension audio tracks, writing rubric guidance, and instant score predictions.',
  'Education',
  'https://tcf.mytechflowlabs.com',
  'Live',
  true,
  '#8b5cf6',
  'from-purple-600 via-violet-600 to-indigo-500',
  'GraduationCap',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  ARRAY['React', 'Web Audio', 'Exam Engine', 'Nivo Charts', 'Supabase'],
  ARRAY['Full-length simulation of Comprehension Orale & Ecrite', 'Automated CLB (Canadian Language Benchmark) converter', 'Detailed answer explanations and error analysis', 'Offline-capable practice question repository'],
  '{"users": "2.8k+", "rating": "4.88/5", "version": "v1.9"}'::JSONB
),
(
  'app-driver-earnings',
  'Driver Earnings Tracker',
  'Smart Multi-Platform Rideshare & Delivery Revenue Intelligence',
  'Designed specifically for gig economy drivers (Uber, Lyft, DoorDash, Instacart). Log gross shift revenues, calculate real fuel and maintenance depreciation, monitor net hourly profitability, and forecast tax liabilities in real-time.',
  'Finance',
  'https://driver-earnings.mytechflowlabs.com',
  'Live',
  true,
  '#f59e0b',
  'from-amber-500 via-orange-600 to-rose-500',
  'DollarSign',
  'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80',
  ARRAY['React', 'PWA', 'IndexedDB', 'Financial Analytics', 'Geolocation'],
  ARRAY['Unified multi-platform income logging', 'Automated mileage deduction & fuel expense tracking', 'Real-time Net vs Gross hourly profit gauges', 'Tax-ready quarterly export summary'],
  '{"users": "4.2k+", "rating": "4.92/5", "version": "v2.2"}'::JSONB
)
ON CONFLICT (id) DO NOTHING;
