
🌐 Si-link App – Project Blueprint

Tagline:

Connecting Students with Local Services – Seamlessly and Intelligently

Overview:

Si-link App is a dynamic mobile and web application that bridges the gap between students and local service providers. Imagine Amazon's product-based browsing, Fiverr's gig-based engagement, and Facebook's social interaction — all in one platform. With Si-link, students can discover services, explore virtual shops, engage providers in real-time chat, post and promote their own gigs, and enjoy a community-driven marketplace backed by a secure and intelligent system.

🔧 Technology Stack

Frontend: React Native (for mobile and web)

Styling: Tailwind CSS

Icons: Tabler Icons

Backend: Serverless (via Supabase)

Database: 

Supabase PostgreSQL

Real-time updates

Supabase Auth

Supabase Edge Functions

💳 Payment Integration

Gateway: Flutterwave

Features:

BVN & NIN Collection (including image)

KYC Verification (Virtual)

In-App Wallet System

Auto Virtual Account Generation

QR Code Payment Logic: 

User generates QR for payment

Receiver scans & pays instantly

Security: OTP required for wallet withdrawals or transfers

🏬 Shop & Product Logic

Shop Model:

Owner (linked profile, verification, phone)

Shop address and banner

Availability: Active / Inactive / Banned

Chat link for direct messaging

Product Model:

Price

Ratings

Availability

Buy → Order → Chat Flow

👤 User Roles & Authentication

Roles:

Student (Customer)

Service Provider (Vendor)

Virtual Assistant (AI Bot)

Authentication: Role-based login and access using Supabase Auth

🎓 Student Features

Gig (Job) Posting:

Owner profile

Job details & deadline

Chat link

Availability toggle

Bids/Requests tracking

Book services, track orders, rate providers, and earn rewards

🧑‍🔧 Service Provider Features

Shop creation & management

Product listings

QR code scanning for job confirmation

Booking & payment tracking

Chat with students and assistants

Profile badges based on trust and service quality

🤖 Virtual Assistant Features

AI-powered support for both students and service providers

Booking assistance & service suggestions

In-app guidance, reminders, and payment alerts

Customer interaction tracking

🖼️ Feeds System

Post types: 

Image (up to 5MB)

Video (5–10MB)

Engagement: Likes, Comments, Shares

Embedded links for Orders and Chat

💬 Chat System Logic

Triggered via: 

Orders

Gigs

Feeds

Shop pages

Chat shows linked profile

Time-limited sessions tied to order or gig status

Adds shop owner to user's chat list

🏅 Badging System

Verified Badge: Confirmed KYC

Premium Badge: For premium users/services

App Owner Badge: For admins

📈 Dashboard & Analytics

Unified dashboard for: 

Analytics & trends

Shop/Gig creation

Chat management

Profile insights

📢 Notifications System

In-app & push notifications for: 

Ratings received

New bids or purchases

Admin alerts: subscriptions, suspensions, etc.

Monthly reminders and badge status

⭐ Rating System

Shops/products accumulate rating scores

Display logic: 

Verified & top-rated first

Top-rated (non-verified) next

Then others by relevance

🎖️ CRA Logic (Customer Reward System)

Recognize top 5 customers monthly

Track engagement, purchases, reviews

“Customer of the Day” recognition

Rewards added to in-app wallet

🧑‍💼 Profile System

Editable profiles (except for verified identity data)

Public/Private toggle

Display: 

Badges

Completed services

Items purchased & reviewed

Service completions for students

🔍 Search & Filter System

Product search linked to shops

Filters: 

Activity Status

Rating

Category

🔁 DevOps & CI/CD

Continuous Deployment enabled

AI Assistant integrated for automated support

💰 Monetization Strategy

Commission on services

Payment gateway processing fees

Premium features/subscription plans

