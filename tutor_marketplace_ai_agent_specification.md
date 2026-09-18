# AI Coding Agent — Complete Tutor Marketplace Product Specification

## 1. PROJECT OVERVIEW

Build a production-ready web application for a location-based private tutor marketplace.

The platform is inspired by the service marketplace model of Fiverr, but it is specifically designed for:

- School students
- College students
- Parents searching for tutors
- Academic tutors
- Music teachers
- Art teachers
- Dance teachers
- Coding instructors
- Language teachers
- Sports/fitness instructors
- Other private educators

The marketplace has three primary user types:

1. Parent / Student
2. Tutor
3. Admin

The key marketplace difference from Fiverr is:

- The parent/student posts a tutoring requirement.
- Tutors discover relevant requirements based on location, category, subject, availability, and other matching criteria.
- Tutors send offers/proposals with their own price.
- Parent/student compares multiple tutors.
- Parent/student can negotiate with tutors.
- Parent/student confirms one tutor.
- For urgent hourly requirements, tutors can receive real-time flash requests.
- Once a tutor is confirmed for an urgent booking, the tutor can share live travel location with the parent/student.
- The platform does NOT process tutoring payments in the initial MVP.
- Payment is handled mutually between tutor and parent/student, similar to an OLX-style marketplace.

Do NOT build online payment, escrow, wallet, payout, commission collection, or payment gateway functionality in the MVP.

The application should instead record the mutually agreed fee as part of the booking.

---

# 2. CORE PRODUCT PHILOSOPHY

The system should be built around this lifecycle:

PARENT/STUDENT NEED  
→ REQUIREMENT POST  
→ LOCATION MATCHING  
→ TUTOR OFFERS  
→ COMPARISON  
→ CHAT / NEGOTIATION  
→ TUTOR CONFIRMATION  
→ BOOKING  
→ SESSION

For urgent tutoring:

FLASH REQUIREMENT  
→ NEARBY TUTORS INSTANTLY NOTIFIED  
→ TUTOR ACCEPTS  
→ PARENT CONFIRMS  
→ TUTOR STARTS TRIP  
→ LIVE LOCATION  
→ ARRIVAL  
→ SESSION  
→ COMPLETION  
→ REVIEW

The product should feel like:

Fiverr-style marketplace  
+ local tutor discovery  
+ Google Maps  
+ real-time communication  
+ Swiggy/Zepto-style urgent fulfillment

but it must NOT blindly clone those services.

---

# 3. TECHNOLOGY STACK

Use the following technology stack.

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Zustand where appropriate
- Socket.IO Client
- Google Maps JavaScript API
- Responsive mobile-first UI

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- Socket.IO
- Mongoose
- MongoDB Atlas

## Database

Use MongoDB Atlas as the primary production database.

Do NOT use PostgreSQL.

Do NOT use Redis.

Do NOT use Docker for the MVP.

Do NOT introduce unnecessary infrastructure.

MongoDB must use appropriate indexes, especially:

- 2dsphere geospatial indexes
- compound indexes for marketplace queries
- indexes on status fields
- indexes on user IDs
- indexes on category/subject
- indexes on createdAt
- indexes needed for flash requests

## Authentication

Use:

- JWT access token
- secure refresh-token strategy
- bcrypt/argon2 password hashing
- role-based authorization

Roles:

- parent
- student
- tutor
- admin

---

# 4. REPOSITORY STRUCTURE

Use a clean monorepo or clearly separated application structure.

Preferred:

apps/
  client/
  server/

packages/
  types/
  config/
  validation/
  ui/

The codebase must be modular.

Do NOT place everything in a single giant file.

Backend should separate:

- routes
- controllers
- services
- repositories/models
- middleware
- validation
- socket handlers
- utilities
- configuration

Frontend should separate:

- pages
- components
- layouts
- hooks
- API services
- state
- types
- feature modules

---

# 5. USER TYPES

## 5.1 Parent

A parent can:

- create account
- create one or multiple student profiles
- post tutoring requirements
- search tutors
- search tutors on a map
- receive tutor offers
- compare tutors
- chat with tutors
- negotiate
- confirm tutor
- manage bookings
- see live tutor location during supported sessions
- review tutors
- report problems

A parent can manage multiple children.

Example:

Parent account:

Child 1 — Class 8  
Child 2 — Class 11  
Child 3 — Piano lessons

---

# 5.2 Student

A student can:

- register
- create student profile
- post requirements
- search tutors
- receive offers
- communicate with tutors
- negotiate
- confirm tutor
- manage bookings
- review tutors
- use flash tutoring

Age-related functionality must be designed carefully.

If minor accounts are allowed, provide a parent/guardian relationship and avoid unnecessarily exposing sensitive personal data.

---

# 5.3 Tutor

Tutor can:

- register
- build tutor profile
- add qualifications
- add certifications
- specify subjects/categories
- specify classes/levels
- specify experience
- specify languages
- set teaching modes
- set service radius
- set availability
- set monthly pricing expectations
- set hourly pricing expectations
- upload profile image
- upload qualification documents
- receive nearby requirements
- submit offers
- negotiate
- chat
- accept flash requests
- confirm availability
- start travel
- share live location
- mark arrival
- complete sessions
- receive reviews
- manage profile

---

# 5.4 Admin

Admin must be able to:

- manage users
- manage tutors
- verify tutors
- review qualification documents
- manage categories
- manage subjects
- manage requirements
- manage offers
- manage bookings
- manage flash requests
- moderate reviews
- handle reports
- suspend accounts
- block accounts
- view marketplace analytics
- view activity logs

---

# 6. CATEGORIES

The platform must not be restricted to school tuition.

Use categories such as:

## Academic

- Mathematics
- Physics
- Chemistry
- Biology
- English
- Hindi
- Odia
- Computer Science
- Social Science
- History
- Geography
- Economics
- Commerce
- Accountancy
- Programming
- Engineering subjects
- College subjects

## Music

- Guitar
- Piano
- Keyboard
- Singing
- Tabla
- Violin
- Flute
- Music theory

## Art

- Drawing
- Painting
- Sketching
- Digital art
- Craft

## Skills

- Coding
- Spoken English
- Public speaking
- Chess
- Dance
- Photography
- Other learning skills

Categories and subjects must be database-driven so the admin can add/edit them.

---

# 7. REQUIREMENT SYSTEM

This is the central marketplace entity.

A parent/student creates a requirement rather than simply searching for a predefined Gig.

Requirement fields should support:

- owner
- student profile
- category
- subject
- title
- description
- class/level
- board/curriculum where applicable
- age where applicable
- preferred qualification
- preferred experience
- teaching mode
- location
- pincode
- latitude
- longitude
- preferred radius
- days
- preferred time slots
- frequency
- start date
- duration
- monthly budget
- hourly budget
- negotiable flag
- urgency
- requirement type
- status
- createdAt
- expiresAt

Requirement types:

- scheduled
- monthly
- hourly
- flash

---

# 8. REQUIREMENT EXAMPLE

Example:

Need Mathematics Tutor

Class:  
10

Board:  
CBSE

Mode:  
Home tuition

Location:  
Pincode 756001

Radius:  
5 km

Schedule:  
Monday  
Wednesday  
Friday

Time:  
6 PM – 7 PM

Budget:  
₹3,000–₹4,000/month

Negotiable:  
Yes

Experience:  
2+ years

Start date:  
October 1

---

# 9. NORMAL REQUIREMENT WORKFLOW

Use this exact conceptual flow:

REQUIREMENT_CREATED  
→ OPEN_FOR_OFFERS  
→ OFFERS_RECEIVED  
→ NEGOTIATION  
→ TUTOR_SELECTED  
→ BOOKING_CREATED  
→ BOOKING_CONFIRMED  
→ ACTIVE  
→ COMPLETED / CANCELLED

A requirement must not allow unlimited conflicting bookings.

When the parent confirms a tutor:

- mark the selected offer accepted
- mark other active offers as declined/closed where appropriate
- create booking
- update requirement status
- notify involved tutors
- preserve historical records

---

# 10. TUTOR OFFER / PROPOSAL SYSTEM

Tutors act like freelancers bidding/proposing on requirements.

A tutor can submit an offer containing:

- tutor ID
- requirement ID
- proposed fee
- pricing period
- proposed schedule
- message
- availability
- estimated travel distance
- offer expiry
- status
- createdAt
- updatedAt

Pricing types:

- hourly
- monthly
- per-session
- custom

Example:

Tutor:

M.Sc Mathematics  
5 years experience  
2.1 km away  
₹3,500/month  
Available Mon/Wed/Fri  
4.8 rating

The platform must allow the parent/student to compare multiple offers.

---

# 11. NEGOTIATION SYSTEM

Implement marketplace negotiation using chat plus formal offer revisions.

Example:

Parent:  
₹3,000/month possible?

Tutor:  
I can do ₹3,400.

Parent:  
₹3,200?

Tutor:  
Accepted.

The final accepted offer must be stored structurally.

Do not rely only on chat text.

Create a final negotiated offer record containing:

- amount
- pricing type
- frequency
- agreed schedule
- agreed start date
- notes
- agreedByParentAt
- agreedByTutorAt

The booking should reference the finalized agreement.

---

# 12. TUTOR DISCOVERY

Users must be able to search tutors independently of requirements.

Search examples:

- Mathematics tutors near me
- Guitar teachers near me
- Art teachers within 5 km
- Coding tutors in my pincode

Support filters:

- category
- subject
- class
- qualification
- experience
- rating
- price
- teaching mode
- language
- distance
- availability
- verified status

---

# 13. MAP-BASED TUTOR DISCOVERY

Use Google Maps.

Provide:

List + Map interface.

Example:

LEFT SIDE:  
Tutor cards

RIGHT SIDE:  
Map

Each tutor can appear as a map marker.

Clicking a marker should open a summary card.

The tutor profile should display approximate location/distance where privacy requires it.

Do NOT expose a tutor's private home address publicly.

The tutor chooses what location information can be shown.

---

# 14. LOCATION MODEL

Use GeoJSON:

location: {
  type: "Point",
  coordinates: [longitude, latitude]
}

Create MongoDB:

2dsphere

index.

Use MongoDB geospatial queries such as:

$near  
$geoWithin  
$geoNear where aggregation is appropriate

Location should be used for:

- nearby tutor discovery
- requirement matching
- tutor service radius
- flash request matching
- approximate distance calculation

Pincode is useful for coarse matching, but actual geographic calculations should use coordinates.

---

# 15. TUTOR SERVICE AREA

Tutor profile should contain:

- home/primary location
- service radius
- preferred areas
- supported pincodes
- teaching mode

Example:

Tutor location:  
[longitude, latitude]

Service radius:  
8 km

The matching service should find tutors within the appropriate radius.

---

# 16. MATCHING ENGINE

Create a dedicated matching service.

Input:

Requirement

Output:

Potential tutors

Match using:

1. category
2. subject
3. class/level
4. teaching mode
5. availability
6. distance
7. service radius
8. price compatibility
9. qualification
10. experience
11. rating
12. verification status

Do not initially build a complex AI ranking system.

Start with deterministic matching.

Keep the matching service modular so an intelligent recommendation system can be added later.

---

# 17. MATCHING LOGIC

Example:

Requirement:

Class 10 CBSE Mathematics  
5 km radius  
Home tuition  
Monday/Wednesday/Friday  
6 PM  
Budget ₹3,000–₹4,000

Potential tutors must match:

- Mathematics
- Class 10
- relevant teaching capability
- available at the requested time
- within service area
- location within requirement radius where applicable

Then sort/display according to transparent marketplace signals such as:

- distance
- rating
- experience
- verification
- availability
- price

Do not create fake scores.

---

# 18. FLASH TUTORING SYSTEM

Flash tutoring is an urgent marketplace mode.

Example:

A parent needs:

Mathematics tutor  
Class 8  
Today  
7 PM  
1 hour  
₹500/hour  
3 km radius

When posted:

1. Create FLASH_REQUEST
2. Find suitable nearby tutors
3. Notify them in real time
4. Tutors see the request instantly
5. Tutors can accept/respond
6. Parent selects/confirms
7. Request becomes locked
8. Booking is created

The flash system must feel immediate.

Use Socket.IO rather than repeatedly polling from the browser.

---

# 19. FLASH REQUEST STATES

Use an explicit state machine:

FLASH_CREATED  
→ SEARCHING  
→ TUTORS_NOTIFIED  
→ TUTOR_RESPONDED  
→ TUTOR_SELECTED  
→ BOOKING_CONFIRMED  
→ TRAVELING  
→ ARRIVED  
→ SESSION_STARTED  
→ SESSION_COMPLETED

Alternative terminal states:

EXPIRED  
CANCELLED  
NO_TUTOR_FOUND

---

# 20. REAL-TIME FLASH NOTIFICATION

Use Socket.IO rooms.

Tutors should be organized into logical matching groups where appropriate.

When a flash request is created:

Backend:

- finds matching tutors
- emits notification
- creates notification record
- starts expiry logic using server-managed timestamps

Frontend:

show an urgent request card.

Example:

FLASH REQUEST

Math Tutor Needed

Class 8

2.4 km away

Starts:  
7:00 PM

Duration:  
1 hour

Offered:  
₹500

Buttons:

[View Request]  
[Accept]

Do not allow two tutors to successfully claim the same exclusive flash booking.

Use an atomic database operation/transaction-safe design when reserving a request.

---

# 21. FLASH REQUEST EXPIRATION

Every flash request must have:

createdAt  
startTime  
expiresAt  
status

When expired:

status = EXPIRED

No further acceptance.

Avoid relying entirely on frontend timers.

Backend must enforce expiration.

---

# 22. LIVE LOCATION TRACKING

For confirmed flash bookings, optionally allow:

Tutor → Start Trip → Share Live Location

Use browser/device geolocation where permitted.

Flow:

TUTOR_CONFIRMED  
→ START_TRIP  
→ LOCATION_SHARING_ACTIVE  
→ ARRIVED  
→ LOCATION_SHARING_STOPPED

Location updates should be sent through Socket.IO.

Parent sees:

- current tutor position
- approximate distance
- last update time
- ETA when available

Do not store high-frequency location history unnecessarily.

---

# 23. LOCATION PRIVACY

Location permissions must be explicit.

The frontend should only request browser geolocation when required.

Do not request continuous location permission on every page.

Only start tracking when:

- booking is confirmed
- tutor explicitly taps Start Trip
- user has granted permission

Stop sharing when:

- tutor arrives
- trip ends
- booking is cancelled
- session tracking expires

Never continuously track tutors when they are offline.

Do not retain unlimited GPS history.

---

# 24. TRAVEL STATUS

Tutor UI:

[Start Trip]

Then:

TRAVELING

Parent UI:

Tutor is on the way.

Map:

Tutor marker  
Student location marker  
route if available

Then tutor presses:

[I've Arrived]

Status:

ARRIVED

Then:

[Start Session]

Status:

SESSION_STARTED

Finally:

[End Session]

Status:

SESSION_COMPLETED

---

# 25. BOOKING MODEL

Bookings must be the central record connecting both parties.

Fields should include:

- parent/student
- tutor
- student profile
- requirement
- offer
- booking type
- agreed amount
- pricing type
- schedule
- location
- start date
- end date
- flash flag
- session date/time
- status
- tracking status
- cancellation data
- timestamps

Do NOT include payment transaction fields as if the platform processed the payment.

Instead store:

agreedFee

paymentMode:  
"direct"

paymentNote:  
"Mutual payment between parent/student and tutor"

This is informational only.

---

# 26. MONTHLY TUTORING

Monthly requirements must support recurring tutoring.

Example:

₹4,000/month

Monday  
Wednesday  
Friday

6 PM – 7 PM

The system does not need a full payroll or recurring payment engine.

It only needs to track:

- active monthly arrangement
- agreed fee
- schedule
- start date
- optional end date
- completed/cancelled status

The actual money is settled directly between both parties.

---

# 27. SESSION MANAGEMENT

For hourly or flash tutoring, support:

- scheduled session
- tutor traveling
- arrived
- started
- completed
- cancelled

For normal recurring tutoring, allow session history optionally.

A session may contain:

- booking
- scheduledStart
- scheduledEnd
- actualStart
- actualEnd
- tutor
- student
- status
- optional notes

---

# 28. CHAT SYSTEM

Implement real-time chat using Socket.IO.

Each conversation should belong to a context where appropriate:

- requirement
- offer
- booking

Support:

- text
- timestamps
- read state
- typing indicator
- online state
- basic attachments if feasible

For MVP, text messaging is the priority.

Do not build a huge social messaging system.

---

# 29. CHAT SAFETY

Do not expose unnecessary contact information publicly.

Allow users to communicate within the platform.

Consider basic content moderation/reporting tools.

Persist messages in MongoDB.

Use pagination for message history.

Do not load thousands of messages at once.

---

# 30. REVIEWS AND RATINGS

After a completed tutoring relationship/session, allow reviews.

Rating:

1–5 stars

Review fields:

- booking
- reviewer
- reviewed user
- rating
- comment
- createdAt
- moderation status

Display:

- average rating
- number of reviews
- recent reviews

Prevent arbitrary duplicate reviews for the same eligible transaction/session.

---

# 31. TUTOR PROFILE

Tutor profile should include:

- profile photo
- name
- headline
- bio
- categories
- subjects
- classes
- qualifications
- certifications
- experience
- languages
- teaching modes
- availability
- service radius
- approximate location
- hourly price
- monthly price
- completed sessions
- rating
- reviews
- verification badge

Example:

Rahul Sharma

Mathematics Tutor

M.Sc Mathematics  
B.Ed

5 years experience

Classes 8–12  
CBSE / ICSE

Home + Online

₹400/hour  
₹3,500/month

4.8 ★  
126 reviews

Verified Tutor

2.1 km away

---

# 32. TUTOR VERIFICATION

Admin can verify:

- identity
- educational qualifications
- certificates
- profile details

Tutor states:

UNVERIFIED  
PENDING_VERIFICATION  
VERIFIED  
REJECTED

Only show "Verified Tutor" when the admin has actually marked the tutor verified.

Do not fabricate verification.

---

# 33. PROFILE COMPLETENESS

Tutor dashboard should show profile completeness.

Example:

Profile 80% complete

Missing:

- qualification document
- availability
- teaching languages

Use this to encourage profile completion.

---

# 34. PARENT/STUDENT DASHBOARD

Dashboard sections:

Overview

My Requirements

Offers Received

Messages

Bookings

Flash Requests

Favorite Tutors

Reviews

Profile

Each requirement should show:

- status
- number of offers
- posted date
- location
- budget
- selected tutor if any

---

# 35. TUTOR DASHBOARD

Dashboard sections:

Overview

Nearby Requirements

My Offers

Active Bookings

Flash Requests

Calendar

Messages

Reviews

Profile

Verification

Settings

Display:

- new nearby requirements
- active offers
- upcoming sessions
- flash opportunities
- response rate
- rating
- completed sessions

Do not fabricate earning numbers because the platform does not process payment.

---

# 36. ADMIN DASHBOARD

Admin dashboard should show:

- total users
- total tutors
- verified tutors
- open requirements
- active bookings
- flash requests
- completed sessions
- cancelled bookings
- reports
- new tutor verification requests

Charts can be added after core functionality works.

---

# 37. NOTIFICATIONS

Support notifications for:

Parent/student:

- requirement created
- new tutor offer
- offer updated
- tutor message
- negotiation update
- tutor selected
- booking confirmation
- tutor started trip
- tutor arrived
- session started
- session completed
- review reminder

Tutor:

- nearby requirement
- new offer-related message
- offer accepted
- offer rejected
- booking confirmed
- flash request
- parent message
- upcoming session
- trip reminder
- verification result

Use:

- in-app notifications
- Socket.IO real-time notification
- optional browser push later

Build notification architecture so email/SMS/WhatsApp can be integrated later.

---

# 38. SEARCH

Search should support:

- subject
- category
- location
- pincode
- tutor name
- keywords

Filters:

- radius
- rating
- experience
- qualification
- price
- teaching mode
- availability
- verified

Use server-side pagination.

---

# 39. PERFORMANCE

Important:

Do not fetch all tutors into the browser.

Use:

- pagination
- geospatial database queries
- indexed searches
- debounced search
- lazy loading
- cached frontend query state
- efficient Socket.IO subscriptions
- image optimization

Map markers should be clustered where necessary.

---

# 40. MONGODB COLLECTIONS

Initial collections:

users  
tutorProfiles  
studentProfiles  
requirements  
offers  
bookings  
sessions  
conversations  
messages  
reviews  
categories  
subjects  
notifications  
flashRequests  
trackingSessions  
reports  
verificationRequests  
availability

Use Mongoose schemas with validation.

Avoid embedding huge unbounded arrays such as all messages directly inside users or conversations.

---

# 41. IMPORTANT MONGODB INDEXES

Create indexes for:

users:
- email
- phone
- role

tutorProfiles:
- userId
- subjects
- categories
- location: "2dsphere"
- verificationStatus
- rating

requirements:
- ownerId
- category
- subject
- location: "2dsphere"
- status
- createdAt

offers:
- requirementId
- tutorId
- status
- createdAt

bookings:
- parentId
- tutorId
- status
- scheduledStart
- createdAt

flashRequests:
- location: "2dsphere"
- status
- category
- subject
- startTime
- expiresAt

messages:
- conversationId
- createdAt

reviews:
- reviewedUserId
- createdAt

---

# 42. MONGOOSE DESIGN RULES

Use:

- timestamps
- schema validation
- enums where appropriate
- ObjectId references where appropriate
- indexes
- lean queries for read-heavy operations
- pagination

Do not create circular model dependencies unnecessarily.

Use service layers rather than embedding complicated business logic inside controllers.

---

# 43. API DESIGN

Use versioned REST APIs:

/api/v1/auth  
/api/v1/users  
/api/v1/tutors  
/api/v1/students  
/api/v1/categories  
/api/v1/requirements  
/api/v1/offers  
/api/v1/bookings  
/api/v1/sessions  
/api/v1/conversations  
/api/v1/messages  
/api/v1/reviews  
/api/v1/flash  
/api/v1/notifications  
/api/v1/maps  
/api/v1/admin

Use consistent:

- HTTP status codes
- error response structure
- validation
- authorization
- pagination format

---

# 44. SOCKET.IO EVENTS

Define explicit event names.

Examples:

auth:
user:online  
user:offline

chat:
message:send  
message:new  
message:read  
typing:start  
typing:stop

flash:
flash:new  
flash:update  
flash:accepted  
flash:expired  
flash:cancelled

booking:
booking:confirmed  
booking:cancelled  
booking:status

tracking:
tracking:start  
tracking:update  
tracking:stop  
tracking:arrived

notifications:
notification:new

Document each event payload.

---

# 45. CONCURRENCY

Flash requests require special care.

Two tutors may click accept simultaneously.

Do not rely on frontend UI to prevent this.

Backend must atomically reserve the flash request.

Use an atomic MongoDB update such as a conditional status transition.

Only one tutor can successfully reserve the exclusive request.

The parent must then confirm the tutor where the workflow requires confirmation.

---

# 46. AUTHORIZATION

Every protected API must check:

1. Authentication
2. Role
3. Resource ownership
4. Booking/relationship authorization

Examples:

A tutor cannot read another tutor's private conversation.

A parent cannot modify somebody else's requirement.

A tutor cannot start travel for a booking that does not belong to them.

A user cannot access arbitrary tracking sessions.

Admin endpoints require admin role.

---

# 47. SECURITY

Implement:

- secure password hashing
- JWT security
- refresh token rotation where used
- HTTP security headers
- CORS configuration
- rate limiting
- request validation
- MongoDB query sanitization
- output escaping where required
- file upload restrictions
- authorization checks
- audit logs for important admin actions

Never expose:

- password hashes
- refresh token secrets
- private environment variables
- internal admin data

---

# 48. LOCATION SECURITY

Location permissions must be explicit.

The frontend should only request browser geolocation when required.

Do not request continuous location permission on every page.

Only start tracking when:

- booking is confirmed
- tutor explicitly taps Start Trip
- user has granted permission

Stop sharing when:

- tutor arrives
- trip ends
- booking is cancelled
- session tracking expires

---

# 49. GOOGLE MAPS INTEGRATION

Structure the Maps integration behind a service/module so it can be modified later.

Possible uses:

- interactive map
- geocoding
- reverse geocoding
- places
- directions
- distance
- route visualization

Do not expose API keys in the backend repository.

Use environment variables.

Frontend keys must use proper Google Maps/browser restrictions.

---

# 50. ENVIRONMENT VARIABLES

Create `.env.example`.

Example:

MONGODB_URI=  
JWT_ACCESS_SECRET=  
JWT_REFRESH_SECRET=  
GOOGLE_MAPS_API_KEY=  
GOOGLE_MAPS_BROWSER_KEY=  
CLIENT_URL=  
SERVER_URL=

Never commit real secrets.

---

# 51. UI/UX DIRECTION

The platform should feel like a premium modern marketplace rather than an outdated classifieds website.

Design priorities:

- clean
- trustworthy
- local
- fast
- responsive
- approachable
- professional
- education-focused

The parent should immediately understand:

Find the right tutor nearby.

The tutor should immediately understand:

Find students near you and respond to requirements.

---

# 52. HOME PAGE

Suggested sections:

Hero:

Find the Right Tutor Near You

Supporting text:

School subjects, college courses, music, art, coding and more.

Primary actions:

Find a Tutor  
Post a Requirement

Secondary section:

Popular categories

How it works

Nearby tutors

Flash tutoring

Verified tutors

Reviews

CTA

The landing page should not feel like Fiverr copied into education.

Create a distinct tutor-marketplace identity.

---

# 53. MAIN NAVIGATION

For parent/student:

Home  
Find Tutors  
Post Requirement  
Flash Tutoring  
Messages  
Bookings  
Profile

For tutor:

Dashboard  
Find Requirements  
Flash Requests  
My Offers  
Bookings  
Messages  
Profile

For admin:

Dashboard  
Users  
Tutors  
Requirements  
Bookings  
Flash  
Verification  
Reports  
Categories  
Analytics  
Settings

---

# 54. REQUIREMENT CREATION UX

Make the requirement form multi-step.

Step 1:  
Who needs tutoring?

Step 2:  
What subject/category?

Step 3:  
Level/class

Step 4:  
Teaching mode

Step 5:  
Location

Step 6:  
Schedule

Step 7:  
Budget

Step 8:  
Additional preferences

Step 9:  
Review and publish

Use conditional fields.

For example:

Music tutor should not ask for school board.

---

# 55. TUTOR SEARCH UI

Use:

Search bar  
Filters  
Sort  
Map/list toggle

Tutor card must quickly communicate:

Photo  
Name  
Category  
Qualification  
Experience  
Rating  
Price  
Distance  
Verified  
Availability

CTA:

View Profile

---

# 56. REQUIREMENT DETAIL PAGE

Show:

Requirement title  
Student level  
Subject  
Schedule  
Location area  
Radius  
Budget  
Description  
Posted time  
Number of offers  
Status

Offer list:

Tutor card  
Qualification  
Experience  
Rating  
Distance  
Proposed price  
Message  
Availability

Actions:

Chat  
Compare  
Accept offer

---

# 57. OFFER COMPARISON

Parent should be able to compare multiple tutors side by side.

Compare:

- price
- qualification
- experience
- rating
- distance
- availability
- verification
- teaching mode

Do not rank tutors as "best" unless based on explicit user-selected sorting criteria.

---

# 58. FLASH UI

Give flash tutoring a visually distinct section.

Example:

FIND A TUTOR RIGHT NOW

Select:

Category  
Subject  
Duration  
Preferred start  
Location  
Budget

Then:

Find Tutors Now

After creation:

Searching nearby tutors...

Then real-time updates.

---

# 59. LIVE TRACKING PAGE

Parent view:

Tutor profile

Status:

ON THE WAY

Map

Tutor location

Distance

Last updated

ETA if supported

Call/chat controls where appropriate

Tutor view:

Start Trip  
Pause/Stop Sharing  
I've Arrived  
Start Session  
End Session

---

# 60. ERROR STATES

Every feature must have proper states:

Loading  
Empty  
Error  
Unauthorized  
Expired  
Cancelled  
Offline  
No tutors found  
No offers  
No flash tutors  
Location permission denied

Do not leave blank screens.

---

# 61. RESPONSIVE DESIGN

The application must work on:

- desktop
- laptop
- tablet
- mobile

Flash requests and live tracking are mobile-critical.

Tutor experience should be optimized for mobile because tutors may use the system while traveling.

Parent experience should also work extremely well on mobile.

---

# 62. ACCESSIBILITY

Use:

- semantic HTML
- keyboard navigation
- proper labels
- accessible buttons
- sufficient contrast
- focus states
- alt text
- meaningful error messages

---

# 63. DATA VALIDATION

Use a schema validation library such as Zod on API boundaries.

Validate:

- email
- phone
- pincode
- coordinates
- prices
- radius
- schedules
- dates
- enums
- ObjectIds
- pagination values

Never trust frontend input.

---

# 64. LOGGING

Use structured backend logging.

Log:

- authentication events
- errors
- important booking transitions
- admin actions
- flash state transitions

Do not log:

- passwords
- JWT secrets
- sensitive private content unnecessarily
- excessive GPS data

---

# 65. AUDITABILITY

Important state transitions should be traceable.

Examples:

requirement created  
offer submitted  
offer accepted  
booking confirmed  
flash claimed  
trip started  
arrival marked  
session completed  
review submitted  
tutor verified

Use timestamps and actor IDs.

---

# 66. NO PAYMENT SYSTEM IN MVP

This is mandatory.

Do NOT implement:

- Razorpay
- Stripe
- PayPal
- wallet
- escrow
- platform commission
- payout system
- withdrawal system
- subscription billing

The platform only records the agreed tutoring fee.

Display:

Payment handled directly between tutor and parent/student.

Do not claim that payment occurred unless the platform actually processes it.

---

# 67. FUTURE-READY PAYMENT DESIGN

Although payment is excluded, structure the booking so future payment integration is possible.

Keep:

agreedFee  
currency  
pricingType  
paymentMode

But do not build payment processing.

---

# 68. NO REDIS

Do NOT introduce Redis.

For MVP:

- MongoDB
- Socket.IO
- in-memory runtime mechanisms where appropriate
- server timestamps
- MongoDB persistence

For delayed/expiry behavior, avoid designing the entire platform around queues.

Flash expiry must still be enforced by database/server logic.

---

# 69. NO POSTGRESQL

Do NOT use PostgreSQL.

Do NOT use Prisma.

Use:

MongoDB Atlas  
+  
Mongoose

---

# 70. NO DOCKER

Do not Dockerize the MVP unless explicitly requested later.

Local development should be straightforward:

Client  
Server  
MongoDB Atlas

---

# 71. DEVELOPMENT PRIORITY

Build in this order.

PHASE 1:  
Project setup  
Authentication  
Roles  
MongoDB connection  
Basic layouts

PHASE 2:  
User profiles  
Tutor profiles  
Student profiles  
Categories  
Subjects

PHASE 3:  
Requirement creation  
Requirement listing  
Requirement detail

PHASE 4:  
Location  
Pincode  
GeoJSON  
2dsphere search  
Nearby tutor discovery

PHASE 5:  
Tutor offers  
Offer comparison  
Negotiation  
Booking

PHASE 6:  
Chat  
Socket.IO  
Notifications

PHASE 7:  
Flash tutoring  
Real-time tutor matching  
Atomic request claiming

PHASE 8:  
Live location  
Tracking  
Trip states  
Arrival  
Session state

PHASE 9:  
Reviews  
Reports  
Tutor verification

PHASE 10:  
Admin dashboard  
Moderation  
Analytics  
Polish

---

# 72. MVP DEFINITION

The MVP is complete only when this full scenario works:

A parent registers.

Parent creates a child.

Parent posts:

"Need Class 10 Mathematics tutor within 5 km."

Parent enters:

- schedule
- location
- pincode
- budget
- preferences

Nearby tutors can discover it.

Three tutors submit offers.

Parent sees:

Tutor A:  
₹3,500

Tutor B:  
₹4,000

Tutor C:  
₹3,200

Parent compares:

qualification  
experience  
rating  
distance  
price  
availability

Parent chats with Tutor B.

Parent negotiates.

Tutor B agrees.

Parent confirms Tutor B.

Booking is created.

For flash:

Parent posts an urgent one-hour requirement.

Nearby tutors immediately receive the request.

One tutor accepts.

Parent confirms.

Tutor starts trip.

Tutor shares live location.

Parent sees tutor moving on Google Maps.

Tutor arrives.

Tutor starts session.

Tutor ends session.

Booking is completed.

Parent reviews tutor.

This complete loop must work before adding optional advanced features.

---

# 73. CODE QUALITY REQUIREMENTS

Do not merely create a visually impressive frontend with fake APIs.

Every major UI action must connect to a real backend.

Avoid:

- hardcoded tutors
- fake requirements
- fake map markers
- fake chat
- fake booking states
- fake reviews
- mock-only dashboards

Temporary seed data is allowed for development, but the architecture must be real.

---

# 74. SEED DATA

Create a development seed script with realistic demo data.

Include:

- several categories
- several subjects
- 10–20 tutors
- different qualifications
- different ratings
- different prices
- different locations
- multiple requirements
- multiple offers
- sample reviews

Locations should be realistic but clearly development/demo data.

---

# 75. TESTING

Add tests for critical backend logic.

At minimum test:

- authentication
- role authorization
- requirement creation
- tutor matching
- geospatial search
- offer creation
- offer acceptance
- booking creation
- flash request atomic claiming
- flash expiration
- tracking authorization
- review validation

Do not only test UI rendering.

---

# 76. API ERROR FORMAT

Use consistent responses.

Example:

{
  "success": false,
  "error": {
    "code": "REQUIREMENT_NOT_FOUND",
    "message": "Requirement not found"
  }
}

Successful response:

{
  "success": true,
  "data": {}
}

---

# 77. PAGINATION

Use cursor or page-based pagination consistently.

Do not return unbounded collections.

For marketplace listings, prefer pagination with:

- page
- limit
- sort

and enforce maximum page size.

---

# 78. FILE UPLOADS

Tutor qualification documents and profile images should not be stored directly as huge binary objects in MongoDB.

Use external object/file storage later or an appropriate image/document storage service.

Store:

- URL
- provider
- metadata
- verification state

For MVP, an appropriate image/document storage provider may be used, but keep the storage layer abstract.

---

# 79. ADMIN MODERATION

Admin should be able to:

- hide inappropriate reviews
- suspend users
- reject tutor verification
- remove prohibited requirements
- review reports
- restore valid content

Do not hard-delete important marketplace records unnecessarily.

Prefer status-based moderation/soft deletion where appropriate.

---

# 80. REPORTING

Users can report:

- tutor
- student/parent
- requirement
- message
- review

Report fields:

- reporter
- target
- type
- reason
- description
- status
- admin notes
- timestamps

Admin can resolve reports.

---

# 81. CANCELLATION

Implement cancellation states.

Possible reasons:

- changed plans
- tutor unavailable
- student unavailable
- inappropriate communication
- emergency
- other

Do not create payment/refund logic.

Simply track cancellation and reason.

---

# 82. PRIVACY

Minimize publicly exposed personal information.

Public tutor profile:

- first/last name as appropriate
- professional profile
- qualifications
- experience
- rating
- approximate location
- service area

Private:

- full personal address
- private contact information where applicable
- private student information
- tracking data

Student/parent data should not be searchable publicly in the same way as tutors.

---

# 83. ADMIN DATA PROTECTION

Admin-only information must never be returned through normal public APIs.

Separate admin routes and authorization middleware.

---

# 84. ARCHITECTURAL EXTENSIBILITY

Design clean extension points for future:

- online payments
- subscriptions
- tutor subscriptions
- premium placement
- AI recommendation
- automated tutor matching
- WhatsApp notifications
- SMS
- email
- mobile app
- video classes
- online classroom
- calendar integration
- attendance
- learning progress
- tutor packages

But do not implement these unless they are part of MVP.

---

# 85. IMPORTANT PRODUCT DISTINCTION

This is NOT:

"Fiverr for teachers"

The product should feel like:

"Find, compare, book, and connect with trusted tutors near you."

Fiverr is only inspiration for:

- proposal/offer model
- marketplace
- reviews
- profiles
- negotiations

Swiggy/Zepto is inspiration only for:

- urgency
- instant matching
- real-time status
- live movement tracking

Do not reproduce their branding, UI, or proprietary implementation.

---

# 86. IMPLEMENTATION RULE

Do not build the entire application in one giant step.

Work feature-by-feature.

For each feature:

1. create database model
2. create validation
3. create backend service
4. create API route/controller
5. add authorization
6. add tests
7. add frontend API integration
8. build UI
9. test complete user flow
10. only then move to the next feature

Do not leave broken placeholder flows behind.

---

# 87. DATABASE-FIRST BUSINESS RULE

Before implementing a UI workflow, define its persistent state and transitions.

Examples:

Requirement status  
Offer status  
Booking status  
Flash status  
Tracking status  
Verification status  
Review status

UI must reflect backend state.

Do not allow frontend-only state to become the source of truth.

---

# 88. FINAL ACCEPTANCE CRITERIA

The implementation must satisfy all of the following:

[ ] Parent authentication works

[ ] Student authentication/profile works

[ ] Tutor authentication works

[ ] Admin authentication works

[ ] Tutor profile creation works

[ ] Tutor qualification information works

[ ] Tutor service radius works

[ ] Parent can create student profiles

[ ] Parent/student can post normal requirements

[ ] Requirement includes location/pincode

[ ] MongoDB geospatial matching works

[ ] Tutors see nearby relevant requirements

[ ] Tutors can submit offers

[ ] Parent/student can compare offers

[ ] Chat works

[ ] Negotiation produces structured final offers

[ ] Parent/student can confirm tutor

[ ] Booking is created correctly

[ ] Flash tutoring works

[ ] Nearby tutors receive real-time flash notifications

[ ] Flash requests cannot be claimed by multiple tutors

[ ] Flash requests expire correctly

[ ] Tutor can start trip

[ ] Tutor can share live location

[ ] Parent can see live tutor location

[ ] Tutor can mark arrived

[ ] Tutor can start/end session

[ ] Reviews work

[ ] Tutor verification works

[ ] Reports work

[ ] Admin moderation works

[ ] Responsive mobile UI works

[ ] No online payment is implemented

[ ] No PostgreSQL is used

[ ] No Redis is used

[ ] No Docker dependency is introduced

[ ] MongoDB Atlas is the primary database

[ ] Real APIs are connected to the frontend

[ ] No important feature is fake/hardcoded

---

# 89. FINAL DEVELOPMENT PRINCIPLE

Prioritize reliability over feature count.

The most important product loop is:

POST REQUIREMENT  
→ MATCH NEARBY TUTORS  
→ RECEIVE OFFERS  
→ COMPARE  
→ CHAT  
→ NEGOTIATE  
→ CONFIRM  
→ BOOK  
→ SESSION

And for urgent requests:

FLASH REQUEST  
→ INSTANT TUTOR MATCH  
→ CONFIRM  
→ LIVE TRAVEL  
→ ARRIVAL  
→ SESSION

Build these loops extremely well first.

Do not add unnecessary enterprise architecture.

Do not over-engineer infrastructure.

Use MongoDB Atlas + Mongoose, Node.js + Express, React + Vite, Socket.IO, and Google Maps as the core technology foundation.

The system must be modular, secure, location-aware, real-time where required, mobile-friendly, and ready for future expansion.
