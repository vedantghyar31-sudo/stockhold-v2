# Stockhold v2.0 – Smart Inventory Management

> Production-ready inventory management SaaS for Indian shop owners.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Firebase (same project as before)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx

# OCR.space (optional — for Scan to Search)
NEXT_PUBLIC_OCR_SPACE_API_KEY=
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Deploy to Netlify
```bash
git add .
git commit -m "Stockhold v2.0"
git push
```
Netlify auto-deploys on push. Add all env vars under **Site Configuration → Environment Variables**.

---

## Firebase Setup

### Firestore Rules
Apply `firestore.rules` in **Firebase Console → Firestore → Rules**.

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Admin Whitelist (Free Access)
In **Firestore Console**, create:
- Collection: `config`
- Document: `admins`
- Field: `emails` (Array)
- Values: add admin email addresses

---

## Firestore Structure

```
users/{userId}/
  products/{productId}     — name, imageUrl, sellingPrice, costPrice, quantity, barcode, createdAt
  bills/{billId}           — invoiceId, customerName, customerMobile, items[], totals, paymentStatus
  subscription/info        — status, startDate, expiryDate, planAmount
  profile/info             — shopName, shopLogo, shopAddress, shopPhone

config/
  admins                   — emails[] (admin whitelist for free access)
```

---

## Features

| Feature | Status |
|---------|--------|
| Firebase Auth (Google + Email) | ✅ |
| Product Management | ✅ |
| Firebase Storage (WebP compressed) | ✅ |
| Billing with 2-step flow | ✅ |
| PDF Invoice Generation | ✅ |
| WhatsApp Invoice Sharing | ✅ |
| Transaction History | ✅ |
| Bill Editing | ✅ |
| Analytics from Billing Data | ✅ |
| Barcode Scanner | ✅ |
| OCR Scan to Search | ✅ |
| Dark Mode | ✅ |
| Subscription (Razorpay ₹2000/mo) | ✅ |
| Admin Free Access | ✅ |
| Privacy Policy / About / Contact | ✅ |

---

## Environment Variables Reference

| Variable | Required | Source |
|----------|----------|--------|
| `NEXT_PUBLIC_FIREBASE_*` | ✅ | Firebase Console |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay Dashboard |
| `NEXT_PUBLIC_OCR_SPACE_API_KEY` | Optional | ocr.space/ocrapi |
