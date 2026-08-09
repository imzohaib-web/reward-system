# Project Development Prompt

I want you to build a complete **Reward System + Wallet System** project for a Super App using a professional software engineering approach.

Do not generate the whole project at once. Develop it **phase by phase**. After completing each phase, explain what was done, provide the code, explain folder structure, and wait for confirmation before moving to the next phase.

## Project Overview

This project is a part of a Super App. It contains two independent portals/services:

1. Reward Service
2. Wallet Service

Both services will communicate with each other through secure REST APIs.

The project should follow a **Microservices Architecture**.

---

# Technology Stack

## Frontend

* Next.js
* React.js

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose ODM

## API Testing

* Postman

## Authentication

* JWT Token Based Authentication
* Secret API Key Authentication between services

## Other Requirements

* REST APIs
* Environment variables (.env)
* Secure API communication
* Proper error handling
* Clean folder structure
* Scalable architecture

---

# Main Architecture

The system should have:

```
Frontend (Next.js + React)

          |

          |

Reward Service (Node.js + Express)

          |

          | Secure API Communication

          |

Wallet Service (Node.js + Express)
```

Reward Service calculates rewards.

Wallet Service manages reward points and transactions.

---

# Reward System Requirements

## 1. Referral Reward

When a user refers another user:

* Only the person who refers will get reward points.
* Referred user will not get any reward.
* Reward should be fixed points.

Example:

Referrer:

+100 Points

---

## 2. Order Based Reward

Orders will not have a separate service.

Order data will be simulated through Postman APIs.

When an order is successful:

Check reward rules.

---

## 3. Free Delivery Reward

Rule:

* After every 10 successful orders,
* On the 11th successful order,
* User gets a Free Delivery reward/token.

Only successful orders should count.

Cancelled orders should not count.

---

## 4. Product Category Reward

If one order contains:

* 3 different products/categories

Then user receives reward points.

Example:

Burger
Pizza
Drink

Reward generated.

Same product repeated should not count.

Example:

Burger
Burger
Burger

No reward.

---

## 5. Reward Expiry

Every reward has expiry.

Expiry duration:

45 Days

After 45 days:

Reward status becomes:

```
EXPIRED
```

Expired rewards cannot be used.

---

## 6. Order Cancellation

If an order is cancelled:

* Reward generated from that order should be removed/revoked.
* Wallet should update automatically.

Reward status:

```
REVOKED
```

---

# Wallet System Requirements

Wallet stores only reward points.

It should maintain:

* Total earned points
* Available points
* Used points
* Expired points
* Revoked points
* Complete transaction history

---

# Reward Point Conversion

Conversion rule:

```
2 Reward Points = Rs.1
```

Example:

200 Points = Rs.100

---

# Reward Redemption

User can use:

100% of available reward points.

Example:

Wallet:

500 Points

Order:

Rs.200

User can use required points and remaining points stay in wallet.

---

# Wallet Transaction Types

Every transaction must have a type:

```
EARNED
REDEEMED
EXPIRED
REVOKED
REFUNDED
```

---

# Database Requirements

Use separate databases:

```
reward_db

wallet_db
```

---

# Reward Database Collections

Create:

```
Users

Orders

Rewards

RewardRules

Referrals
```

Reward collection should contain:

* rewardId
* userId
* orderId
* rewardType
* points
* status
* expiryDate
* timestamps

Reward Types:

```
REFERRAL

ORDER

FREE_DELIVERY
```

Reward Status:

```
ACTIVE

USED

EXPIRED

REVOKED
```

---

# Wallet Database Collections

Create:

```
Wallets

WalletTransactions
```

Wallet should contain:

* userId
* totalEarnedPoints
* totalRedeemedPoints
* expiredPoints
* revokedPoints
* availablePoints

Wallet Transaction should contain:

* userId
* rewardId
* orderId
* transactionType
* points
* balanceAfterTransaction
* timestamps

---

# Authentication Requirements

## User Authentication

Use:

JWT Token

Flow:

User Login

↓

JWT Generated

↓

Protected APIs

↓

JWT Verification

---

## Service Authentication

Reward Service calling Wallet Service:

Use:

Secret API Key

Example Header:

```
x-api-key: SECRET_KEY
```

Wallet Service must verify this key.

---

# Required APIs

## Reward Service APIs

Create:

```
POST /reward/referral

POST /reward/order

POST /reward/cancel

GET /reward/history/:userId

GET /reward/summary/:userId

POST /reward/preview
```

---

## Wallet Service APIs

Create:

```
GET /wallet/:userId

GET /wallet/history/:userId

POST /wallet/add

POST /wallet/redeem

POST /wallet/refund

POST /wallet/revoke

POST /wallet/expire
```

---

# Development Phases

Follow these phases:

## Phase 1

Requirement analysis and system design

Provide:

* Architecture diagram
* Data flow
* Module explanation

## Phase 2

Project setup

Create:

* Reward Service
* Wallet Service
* Folder structure
* Node.js setup
* Express setup
* Environment configuration

## Phase 3

Database implementation

Create:

* MongoDB connection
* Mongoose models
* Collections

## Phase 4

Authentication

Implement:

* JWT authentication
* Protected routes
* API Secret Key middleware

## Phase 5

Reward Service Development

Implement:

* Referral reward
* Order reward
* Free delivery logic
* 3 product reward
* Expiry system
* Cancel order logic

## Phase 6

Wallet Service Development

Implement:

* Add points
* Redeem points
* Refund points
* Transaction history
* Expiry handling

## Phase 7

API Integration

Connect:

Reward Service

with

Wallet Service

## Phase 8

Testing

Provide:

* Complete Postman Collection
* Test cases
* Error scenarios

## Phase 9

Frontend Development

Create Next.js + React UI:

* Login
* Wallet dashboard
* Reward history
* Transaction history

## Phase 10

Final Documentation

Provide:

* Project report
* API documentation
* Database diagram
* Deployment guide

Important:
Write clean production-level code.
Explain every step.
Do not skip any requirement.
Do not combine phases.
Wait for confirmation before moving to the next phase.
