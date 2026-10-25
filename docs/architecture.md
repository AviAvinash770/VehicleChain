# VehicleChain System Architecture

## 1. Executive Summary

**VehicleChain** is a decentralized, tamper-evident vehicle registration and ownership transfer system designed for academic defense and research. It eliminates document forgery, illegal vehicle cloning, and unauthorized ownership transfers through Ethereum-compatible smart contracts, SHA-256 cryptographic document verification, and decentralized IPFS storage.

---

## 2. Layered Architecture

```
+-------------------------------------------------------------------------+
|                           1. FRONTEND LAYER                             |
|  React.js (Vite + TS) | Tailwind CSS (HSRP Plate Theme) | Lucide Icons   |
|  MetaMask Ethers.js  | QR Scanner (HTML5-QRCode)        | Role Portals   |
+------------------------------------+------------------------------------+
                                     | REST API (JSON)
+------------------------------------v------------------------------------+
|                            2. BACKEND LAYER                             |
|  Node.js + Express.js + TypeScript                                      |
|  - JWT Authentication & Role-Based Access Control (RBAC)                |
|  - Cryptographic SHA-256 Document Processing                            |
|  - Smart Contract Interaction Service (Ethers.js)                       |
|  - In-App Notifications & Audit Trail Logging                           |
+------------------+------------------------------+-----------------------+
                   |                              |
+------------------v---------+  +-----------------v-----------------------+
|    3. DATA STORAGE LAYER   |  |        4. BLOCKCHAIN LAYER              |
| - MongoDB (Mongoose)       |  | - VehicleRegistry.sol (Solidity 0.8.24) |
| - Embedded Mongo Fallback  |  | - Hardhat Local Node (Chain ID: 31337)  |
| - IPFS (Pinata / Gateway)  |  | - OpenZeppelin AccessControl            |
| - QR Code Generator        |  | - Immutable Ownership History Log       |
+----------------------------+  +-----------------------------------------+
```

---

## 3. Core State Machines

### A. Vehicle Status Lifecycle
- **ACTIVE (0)**: Normal verified status. Vehicle can be legally driven and transferred.
- **SUSPENDED (1)**: Administratively locked by RTO Authority (e.g. pending challans, police alert). Any active transfer requests are automatically cancelled.
- **DEREGISTERED (2)**: Permanently retired, scrapped, or deregistered. No further transfers permitted.

### B. Ownership Transfer 3-Way State Machine
```
[Owner Initiates] 
       |
       v
 PENDING_BUYER ----(Buyer Rejects)----> REJECTED
       |
       v (Buyer Accepts)
 PENDING_AUTHORITY ----(RTO Rejects)--> REJECTED
       |
       v (RTO Approves)
   COMPLETED (Smart contract updates currentOwner to Buyer)
```

---

## 4. Document Integrity & Privacy Invariants

1. **Zero Raw Documents On-Chain**: Raw identity documents and files are never stored directly on the blockchain. Instead, only the cryptographic SHA-256 hash (32 bytes hex) and IPFS CID are anchored to the contract.
2. **Public Data Sanitization**: Public verification endpoints mask owner wallet addresses (e.g., `0x7099...79c8`) and never disclose personal phone numbers, email addresses, or passwords.
3. **Role Segregation**:
   - Only authorized RTO accounts possessing `RTO_AUTHORITY_ROLE` can register vehicles or approve ownership transfers.
   - Only the verified current owner can initiate a transfer.
   - Only the designated buyer wallet can sign acceptance.
