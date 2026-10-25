# VehicleChain REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Body**:
```json
{
  "name": "Vikram Malhotra",
  "email": "owner@vehiclechain.gov.in",
  "password": "Password@123",
  "role": "OWNER",
  "walletAddress": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "phone": "+91 98123 45678"
}
```
- **Response (201)**: `{ success: true, token: "...", user: { ... } }`

### Login
- **POST** `/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response (200)**: `{ success: true, token: "...", user: { ... } }`

### Current Session User
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**: `{ success: true, user: { ... } }`

---

## 2. Vehicle Endpoints

### Register Vehicle (Authority Only)
- **POST** `/vehicles/register`
- **Headers**: `Authorization: Bearer <authority_token>`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `vehicleId`: `VEH-2026-000001`
  - `registrationNumber`: `AP 39 AB 2026`
  - `vin`: `MA3EFA123RK876543`
  - `manufacturer`: `Tata Motors`
  - `model`: `Nexon EV Empowered`
  - `year`: `2024`
  - `vehicleType`: `Electric Compact SUV`
  - `initialOwnerWallet`: `0x70997970c51812dc3a010c7d01b50e0d17dc79c8`
  - `document`: `<file attachment>`
- **Response (201)**: Returns vehicle document with `registrationTxHash`, `initialDocHash`, and `qrCodeDataUrl`.

### List Vehicles
- **GET** `/vehicles?search=&status=&page=1&limit=20`
- **Headers**: `Authorization: Bearer <token>`
- Role-filtered (Authority sees all; Owner sees owned).

### Vehicle Details with On-Chain History
- **GET** `/vehicles/:id`
- Returns vehicle specs, on-chain state, and immutable ownership history array.

### Verify Document Integrity
- **POST** `/vehicles/:id/verify-document`
- **Content-Type**: `multipart/form-data`
- **Body**: `document`: `<file attachment>`
- **Response (200)**:
```json
{
  "success": true,
  "verified": true,
  "calculatedHash": "8c6976e5b5410415...",
  "registeredHash": "8c6976e5b5410415...",
  "message": "Cryptographic document hash MATCHES registered record! Document integrity confirmed."
}
```

---

## 3. Ownership Transfer Endpoints

### Initiate Transfer (Current Owner Only)
- **POST** `/transfers/initiate`
- **Form Fields**: `vehicleId`, `buyerWallet`, `buyerEmail`, `salePrice`, `agreement` (file)
- **Response (201)**: Creates transfer request with status `PENDING_BUYER`.

### Buyer Response (Accept or Reject)
- **POST** `/transfers/:id/buyer-response`
- **Body**: `{ "accept": true, "rejectionReason": "" }`

### Authority Adjudication (Approve or Reject)
- **POST** `/transfers/:id/authority-response`
- **Body**: `{ "approve": true, "rejectionReason": "" }`
- Executes on-chain transfer, updates current owner, sets status `COMPLETED`.

---

## 4. Public Verification Endpoints (No Auth Required)

### Public Vehicle Query
- **GET** `/public/verify/:query`
- Returns sanitized vehicle record with masked owner wallet (`0x7099...79c8`), blockchain confirmation tx, and QR code.

### Public Document Hash Verification
- **POST** `/public/verify-hash`
- Upload any file to test against a vehicle ID.
