# Reward System & Wallet Microservices Project Prompt

You are acting as a Senior Software Architect and Backend Engineer.

Your task is to help me build a production-level Reward System and Wallet System using microservice architecture.

Follow this document as the complete project requirement. Do not change business rules unless I ask.

---

# Project Overview

I am building a new ecosystem that contains multiple applications:

1. Food Delivery App
2. SuperMall App

Both applications will use the same:

- Reward System
- Wallet System

Reward System and Wallet System will be separate services and will connect with other applications using APIs.

The first goal is to build and test:

Reward Service <---- API ----> Wallet Service

After completing and testing these two services, they will be connected with Food App and SuperMall App through APIs.

For testing Order Service, we will simulate orders using Postman because Order Service is not being developed currently.

---

# Technology Stack

**Backend:**
- Node.js
- Express.js

**Frontend/Admin Panel:**
- Next.js
- React.js

**Database:**
- MongoDB

**API Testing:**
- Postman
- Postman Collection

**Authentication:**
- API Secret Key
- Token Based Authentication (JWT)

**Architecture:**
- Microservices Architecture

---

# Important Development Rule

The project will be developed in phases.

After completing every phase:
1. Test the phase completely.
2. Create API tests in Postman.
3. Verify success cases.
4. Verify failure cases.
5. Verify security.
6. Fix errors before moving to the next phase.

**Never move to the next phase without testing the previous phase.**

---

# System Architecture

```
Food App
   |
   API
   |
   ↓
Reward Service
   |
   API
   |
   ↓
Wallet Service
   ↑
   |
   |
SuperMall App
```

Reward Service and Wallet Service must never directly access each other's databases.

Communication will only happen through APIs.

---

# Services

## 1. Reward Service

Responsibilities:
- Calculate rewards.
- Apply reward rules.
- Check customer eligibility.
- Generate rewards.
- Handle expiry.
- Reverse rewards when required.
- Communicate with Wallet Service API.

Reward Service does not store wallet balance.

## 2. Wallet Service

Responsibilities:
- Store customer rewards.
- Store reward history.
- Maintain available rewards.
- Consume rewards.
- Remove rewards.
- Expire rewards.
- Show wallet history.

Wallet Service does not calculate rewards.

---

# Database Architecture

Both services will have separate MongoDB databases.

## Reward Database
Collections:
- reward_rules
- reward_transactions
- referral_records
- reward_logs

## Wallet Database
Collections:
- wallets
- wallet_transactions
- reward_history

---

# Business Rules

## 1. Referral Reward
When user refers another user:
- Only the person who referred gets reward.
- New user gets no reward.

Reward is given only after referred user's order is successfully completed.

**Reward: 100 Points**

## 2. Product Reward
If a customer buys 3 different products in a single order:

**Reward: 20 Points**

Condition: Only 3 different products are required. Categories are not considered.

## 3. Free Delivery Reward
After every 10 successful completed orders:

**Customer receives: 1 Free Delivery Token**

Rules:
- Cancelled orders do not count.
- Failed orders do not count.
- Pending orders do not count.
- Only completed orders count.

## 4. Reward Expiry
Every reward has:

**Expiry: 45 Days**

After expiry, Status: **Expired**

Expired rewards:
- Cannot be used.
- Remain in history.
- Are never deleted.

## 5. Reward Conversion
**100 Points = Rs 50 Discount**

## 6. Free Delivery Token
Rules:
- One token can be used only one time.
- After use, token status becomes Used.

## 7. Duplicate Reward Protection
One Order ID can generate reward only one time.
If the same order API request is sent multiple times: Do not create duplicate rewards.

## 8. Order Completion Rule
Rewards are generated only after: Order Status = Completed
Before completion: No reward is generated.

## 9. Reward History
History should never be deleted.

Statuses:
- Earned
- Used
- Expired
- Reversed

---

# Reward Rules System

Do not hardcode rewards inside code. Create a dynamic `reward_rules` collection.

**Example Referral Rule:**
```json
{
  "rewardType": "Points",
  "value": 100,
  "expiry": "45 Days",
  "status": "Active"
}
```

**Example 3 Product Rule:**
```json
{
  "rewardType": "Points",
  "value": 20,
  "expiry": "45 Days",
  "status": "Active"
}
```

**Example 10 Orders Rule:**
```json
{
  "rewardType": "Free Delivery Token",
  "value": 1,
  "expiry": "45 Days",
  "status": "Active"
}
```

Admin can change these values later without changing code.

---

# Admin Panel Requirements

Create Admin Panel using: **Next.js + React**

Admin Features:
- Login
- View reward rules
- Update reward rules
- Enable/disable reward rules
- Change reward points
- Change expiry days
- View customer wallet
- View reward history
- View transactions

---

# Authentication

All APIs must be protected.

Use:
1. API Secret Key
2. JWT Token Authentication

Service-to-service communication must be secure.

---

# Notification System

When reward is generated:
- Return API response.
- Create notification/event structure for future integration.

---

# Development Phases

## Phase 1: Project Setup
**Tasks:**
- Create project folders.
- Initialize Node.js projects.
- Install dependencies.
- Setup Express.
- Setup environment variables.
- Create folder architecture.

**Testing:**
- Run both services.
- Check server response.
- Verify environment loading.

## Phase 2: Wallet Service Development
**Tasks:** Create Wallet Model, Wallet Transaction Model, Wallet APIs.

**APIs:**
- `POST /api/wallet/add` — Reward Service sends reward to wallet
- `POST /api/wallet/use` — Consume points/token
- `POST /api/wallet/remove` — Remove reward
- `GET /api/wallet/history`
- `GET /api/wallet/balance`

**Testing (Postman):** Add reward, Check balance, Check history, Use reward, Remove reward, Test invalid user, Test authentication.

## Phase 3: Reward Service Development
**Tasks:** Create Reward Rule Model, Reward Calculation Logic, Reward APIs.

**APIs:**
- `POST /api/reward/order`
- `POST /api/reward/referral`
- `GET /api/reward/rules`
- `PUT /api/reward/rules`

**Testing (Postman):** Completed order reward, Referral reward, 3 product reward, 10 order reward, Duplicate order test, Invalid request test.

## Phase 4: Reward Service + Wallet Integration
**Connect:** Reward Service -> Wallet API

**Flow:** Order Completed -> Reward Engine checks rules -> Reward Generated -> Wallet API called -> Reward saved

**Testing (Postman):** Send completed order, Verify reward generated, Verify wallet balance updated, Verify wallet history.

## Phase 5: Authentication Implementation
**Implement:** API Key middleware, JWT authentication, Protected routes.

**Testing:** Valid token, Invalid token, Missing token, Wrong API key.

## Phase 6: Expiry System
**Implement:** Reward expiry date, Cron Job, Automatic expiration.

**Testing:** Create old reward, Run expiry process, Verify status changed to Expired.

## Phase 7: Admin Panel
**Create:** Next.js + React Admin Dashboard

**Features:** Login, Reward rule management, Wallet view, History view.

**Testing:** Admin login, Update reward, Verify API changes.

## Phase 8: Final Integration Testing
Complete system testing:
- Food App Simulation -> Reward Service -> Wallet Service
- SuperMall Simulation -> Reward Service -> Wallet Service

**Testing:** Complete order flow, Referral flow, Reward usage, Token usage, Expiry, Authentication, Error handling.

---

# Coding Rules

While developing:
- Explain every step.
- Provide complete code.
- Use clean architecture.
- Keep services independent.
- Use proper MongoDB schemas.
- Use REST API standards.
- Test after every phase.
- Do not skip steps.
- Ask questions if requirements are unclear.

This document is the complete source of truth for this project.
