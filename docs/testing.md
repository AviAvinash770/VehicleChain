# VehicleChain Testing & Verification Guide

## 1. Smart Contract Unit Tests

The smart contract test suite in `blockchain/test/VehicleRegistry.test.ts` contains 16 automated test cases covering:
1. Role assignment (`DEFAULT_ADMIN_ROLE`, `RTO_AUTHORITY_ROLE`)
2. Vehicle registration by authorized RTO
3. Duplicate vehicle ID, registration number, and VIN hash rejection
4. Unauthorized caller rejection
5. Transfer initiation by current owner
6. Non-owner transfer attempt rejection
7. Suspended vehicle transfer rejection
8. Duplicate pending transfer request prevention
9. Buyer acceptance and rejection flows
10. Wrong-buyer response rejection
11. Full end-to-end transfer workflow with authority approval and on-chain ownership update
12. Authority rejection without changing owner
13. Document SHA-256 hash validation against smart contract

To run smart contract tests:
```bash
cd blockchain
npx hardhat test
```
Result: `16 passing (3s)`

---

## 2. Backend API Tests

The backend test suite in `backend/tests/api.test.ts` contains 13 automated tests using Vitest and Supertest covering:
1. User registration & role assignment (Authority, Owner, Buyer)
2. Password hashing & duplicate email prevention
3. JWT generation & login validation
4. Role-based authorization enforcement
5. Vehicle registration with simulated document upload & SHA-256 hash generation
6. Duplicate vehicle rejection
7. Document hash integrity verification (matching file vs tampered file)
8. Public verification endpoint & confidential data masking

To run backend tests:
```bash
cd backend
npm test
```
Result: `13 passing (2.6s)`

---

## 3. Frontend Production Build Test

To test TypeScript typing, JSX syntax, and Tailwind CSS compilation for the frontend:
```bash
cd frontend
npm run build
```
Result: `✓ built in 19s` with zero errors.
