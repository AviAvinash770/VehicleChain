// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VehicleRegistry
 * @dev VehicleChain Core Smart Contract
 * Manages vehicle registration, ownership transfer workflow, document hash verification,
 * and immutable ownership history.
 */
contract VehicleRegistry is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant RTO_AUTHORITY_ROLE = keccak256("RTO_AUTHORITY_ROLE");

    // Enums
    enum VehicleStatus {
        ACTIVE,
        SUSPENDED,
        DEREGISTERED
    }

    enum TransferStatus {
        NONE,
        PENDING_BUYER,
        PENDING_AUTHORITY,
        APPROVED,
        REJECTED,
        COMPLETED,
        CANCELLED
    }

    // Structs
    struct Vehicle {
        string vehicleId;            // Unique system ID (e.g., VEH-2026-000001)
        string registrationNumber;   // Standard plate number (e.g., AP 39 AB 2026)
        string vinHash;              // Cryptographic hash of VIN/Chassis
        string manufacturer;
        string model;
        uint16 year;
        string vehicleType;          // Sedan, SUV, Commercial, EV, etc.
        address currentOwner;
        VehicleStatus status;
        uint256 registrationTimestamp;
        string initialDocHash;       // SHA-256 of registration/RC doc
        string ipfsDocCID;           // IPFS CID of RC / registration docs
        bool exists;
    }

    struct TransferRequest {
        uint256 requestId;
        string vehicleId;
        address currentOwner;
        address buyer;
        TransferStatus status;
        uint256 requestTimestamp;
        uint256 buyerActionTimestamp;
        uint256 authorityActionTimestamp;
        string transferDocHash;      // SHA-256 of sale deed / transfer agreement
        string ipfsDocCID;           // IPFS CID of transfer agreement
        string rejectionReason;
        bool exists;
    }

    struct OwnershipRecord {
        address owner;
        uint256 transferTimestamp;
        uint256 transferRequestId; // 0 for initial registration
        string documentHash;
    }

    // State Variables
    uint256 private _transferRequestCounter;
    string[] private _vehicleIds;

    // vehicleId => Vehicle
    mapping(string => Vehicle) private _vehicles;
    // registrationNumber => vehicleId
    mapping(string => string) private _regNumberToVehicleId;
    // vinHash => vehicleId
    mapping(string => string) private _vinHashToVehicleId;
    // vehicleId => OwnershipRecord[]
    mapping(string => OwnershipRecord[]) private _ownershipHistories;
    // requestId => TransferRequest
    mapping(uint256 => TransferRequest) private _transferRequests;
    // vehicleId => active requestId (0 if none)
    mapping(string => uint256) private _activeTransferByVehicle;
    // vehicleId => array of all requestIds
    mapping(string => uint256[]) private _vehicleTransferRequests;

    // Events
    event VehicleRegistered(
        string indexed vehicleId,
        string indexed registrationNumber,
        address indexed owner,
        string vinHash,
        uint256 timestamp
    );

    event TransferInitiated(
        uint256 indexed requestId,
        string indexed vehicleId,
        address indexed currentOwner,
        address buyer,
        string transferDocHash,
        uint256 timestamp
    );

    event TransferRespondedByBuyer(
        uint256 indexed requestId,
        string indexed vehicleId,
        address indexed buyer,
        bool accepted,
        string reason,
        uint256 timestamp
    );

    event TransferApprovedByAuthority(
        uint256 indexed requestId,
        string indexed vehicleId,
        address indexed previousOwner,
        address newOwner,
        uint256 timestamp
    );

    event TransferRejectedByAuthority(
        uint256 indexed requestId,
        string indexed vehicleId,
        address indexed authority,
        string reason,
        uint256 timestamp
    );

    event TransferCancelled(
        uint256 indexed requestId,
        string indexed vehicleId,
        address indexed owner,
        uint256 timestamp
    );

    event VehicleStatusUpdated(
        string indexed vehicleId,
        VehicleStatus previousStatus,
        VehicleStatus newStatus,
        string reason,
        uint256 timestamp
    );

    // Custom Errors
    error VehicleAlreadyExists(string vehicleId);
    error RegNumberAlreadyExists(string registrationNumber);
    error VinAlreadyExists(string vinHash);
    error VehicleNotFound(string vehicleId);
    error InvalidOwnerAddress();
    error VehicleNotActive(string vehicleId, VehicleStatus status);
    error NotVehicleOwner(string vehicleId, address caller);
    error InvalidBuyerAddress();
    error TransferAlreadyPending(string vehicleId, uint256 activeRequestId);
    error TransferRequestNotFound(uint256 requestId);
    error NotTargetBuyer(uint256 requestId, address caller);
    error InvalidTransferState(uint256 requestId, TransferStatus currentStatus);
    error UnauthorizedAuthority();

    constructor(address initialAuthority) {
        require(initialAuthority != address(0), "Invalid initial authority");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RTO_AUTHORITY_ROLE, msg.sender);
        if (initialAuthority != msg.sender) {
            _grantRole(RTO_AUTHORITY_ROLE, initialAuthority);
        }
    }

    // ==========================================
    // 1. VEHICLE REGISTRATION (Authority Only)
    // ==========================================

    function registerVehicle(
        string calldata vehicleId,
        string calldata registrationNumber,
        string calldata vinHash,
        string calldata manufacturer,
        string calldata model,
        uint16 year,
        string calldata vehicleType,
        address initialOwner,
        string calldata initialDocHash,
        string calldata ipfsDocCID
    ) external onlyRole(RTO_AUTHORITY_ROLE) returns (bool) {
        if (_vehicles[vehicleId].exists) revert VehicleAlreadyExists(vehicleId);
        if (bytes(_regNumberToVehicleId[registrationNumber]).length > 0) {
            revert RegNumberAlreadyExists(registrationNumber);
        }
        if (bytes(_vinHashToVehicleId[vinHash]).length > 0) {
            revert VinAlreadyExists(vinHash);
        }
        if (initialOwner == address(0)) revert InvalidOwnerAddress();

        uint256 timestamp = block.timestamp;

        _vehicles[vehicleId] = Vehicle({
            vehicleId: vehicleId,
            registrationNumber: registrationNumber,
            vinHash: vinHash,
            manufacturer: manufacturer,
            model: model,
            year: year,
            vehicleType: vehicleType,
            currentOwner: initialOwner,
            status: VehicleStatus.ACTIVE,
            registrationTimestamp: timestamp,
            initialDocHash: initialDocHash,
            ipfsDocCID: ipfsDocCID,
            exists: true
        });

        _regNumberToVehicleId[registrationNumber] = vehicleId;
        _vinHashToVehicleId[vinHash] = vehicleId;
        _vehicleIds.push(vehicleId);

        _ownershipHistories[vehicleId].push(OwnershipRecord({
            owner: initialOwner,
            transferTimestamp: timestamp,
            transferRequestId: 0,
            documentHash: initialDocHash
        }));

        emit VehicleRegistered(
            vehicleId,
            registrationNumber,
            initialOwner,
            vinHash,
            timestamp
        );

        return true;
    }

    // ==========================================
    // 2. OWNERSHIP TRANSFER WORKFLOW
    // ==========================================

    /**
     * @notice Step 1: Current Owner initiates transfer to Buyer
     */
    function initiateTransfer(
        string calldata vehicleId,
        address buyer,
        string calldata transferDocHash,
        string calldata ipfsDocCID
    ) external nonReentrant returns (uint256) {
        Vehicle storage vehicle = _vehicles[vehicleId];
        if (!vehicle.exists) revert VehicleNotFound(vehicleId);
        if (vehicle.status != VehicleStatus.ACTIVE) revert VehicleNotActive(vehicleId, vehicle.status);
        if (vehicle.currentOwner != msg.sender) revert NotVehicleOwner(vehicleId, msg.sender);
        if (buyer == address(0) || buyer == msg.sender) revert InvalidBuyerAddress();

        uint256 currentActiveReq = _activeTransferByVehicle[vehicleId];
        if (currentActiveReq != 0) {
            TransferStatus s = _transferRequests[currentActiveReq].status;
            if (s == TransferStatus.PENDING_BUYER || s == TransferStatus.PENDING_AUTHORITY) {
                revert TransferAlreadyPending(vehicleId, currentActiveReq);
            }
        }

        _transferRequestCounter++;
        uint256 newRequestId = _transferRequestCounter;
        uint256 timestamp = block.timestamp;

        _transferRequests[newRequestId] = TransferRequest({
            requestId: newRequestId,
            vehicleId: vehicleId,
            currentOwner: msg.sender,
            buyer: buyer,
            status: TransferStatus.PENDING_BUYER,
            requestTimestamp: timestamp,
            buyerActionTimestamp: 0,
            authorityActionTimestamp: 0,
            transferDocHash: transferDocHash,
            ipfsDocCID: ipfsDocCID,
            rejectionReason: "",
            exists: true
        });

        _activeTransferByVehicle[vehicleId] = newRequestId;
        _vehicleTransferRequests[vehicleId].push(newRequestId);

        emit TransferInitiated(
            newRequestId,
            vehicleId,
            msg.sender,
            buyer,
            transferDocHash,
            timestamp
        );

        return newRequestId;
    }

    /**
     * @notice Step 2: Buyer responds (Accept or Reject)
     */
    function respondTransferAsBuyer(
        uint256 requestId,
        bool accept,
        string calldata rejectionReason
    ) external nonReentrant {
        TransferRequest storage req = _transferRequests[requestId];
        if (!req.exists) revert TransferRequestNotFound(requestId);
        if (req.buyer != msg.sender) revert NotTargetBuyer(requestId, msg.sender);
        if (req.status != TransferStatus.PENDING_BUYER) {
            revert InvalidTransferState(requestId, req.status);
        }

        Vehicle storage vehicle = _vehicles[req.vehicleId];
        if (vehicle.status != VehicleStatus.ACTIVE) revert VehicleNotActive(req.vehicleId, vehicle.status);

        uint256 timestamp = block.timestamp;
        req.buyerActionTimestamp = timestamp;

        if (accept) {
            req.status = TransferStatus.PENDING_AUTHORITY;
        } else {
            req.status = TransferStatus.REJECTED;
            req.rejectionReason = rejectionReason;
            _activeTransferByVehicle[req.vehicleId] = 0;
        }

        emit TransferRespondedByBuyer(
            requestId,
            req.vehicleId,
            msg.sender,
            accept,
            rejectionReason,
            timestamp
        );
    }

    /**
     * @notice Step 3: Authority approves or rejects transfer
     */
    function respondTransferAsAuthority(
        uint256 requestId,
        bool approve,
        string calldata rejectionReason
    ) external onlyRole(RTO_AUTHORITY_ROLE) nonReentrant {
        TransferRequest storage req = _transferRequests[requestId];
        if (!req.exists) revert TransferRequestNotFound(requestId);
        if (req.status != TransferStatus.PENDING_AUTHORITY) {
            revert InvalidTransferState(requestId, req.status);
        }

        Vehicle storage vehicle = _vehicles[req.vehicleId];
        if (vehicle.status != VehicleStatus.ACTIVE) revert VehicleNotActive(req.vehicleId, vehicle.status);

        uint256 timestamp = block.timestamp;
        req.authorityActionTimestamp = timestamp;

        if (approve) {
            req.status = TransferStatus.COMPLETED;
            address previousOwner = vehicle.currentOwner;
            vehicle.currentOwner = req.buyer;

            // Record into immutable ownership history
            _ownershipHistories[req.vehicleId].push(OwnershipRecord({
                owner: req.buyer,
                transferTimestamp: timestamp,
                transferRequestId: requestId,
                documentHash: req.transferDocHash
            }));

            _activeTransferByVehicle[req.vehicleId] = 0;

            emit TransferApprovedByAuthority(
                requestId,
                req.vehicleId,
                previousOwner,
                req.buyer,
                timestamp
            );
        } else {
            req.status = TransferStatus.REJECTED;
            req.rejectionReason = rejectionReason;
            _activeTransferByVehicle[req.vehicleId] = 0;

            emit TransferRejectedByAuthority(
                requestId,
                req.vehicleId,
                msg.sender,
                rejectionReason,
                timestamp
            );
        }
    }

    /**
     * @notice Current Owner can cancel an initiated transfer before buyer acts
     */
    function cancelTransfer(uint256 requestId) external nonReentrant {
        TransferRequest storage req = _transferRequests[requestId];
        if (!req.exists) revert TransferRequestNotFound(requestId);
        if (req.currentOwner != msg.sender) revert NotVehicleOwner(req.vehicleId, msg.sender);
        if (req.status != TransferStatus.PENDING_BUYER) {
            revert InvalidTransferState(requestId, req.status);
        }

        req.status = TransferStatus.CANCELLED;
        _activeTransferByVehicle[req.vehicleId] = 0;

        emit TransferCancelled(requestId, req.vehicleId, msg.sender, block.timestamp);
    }

    // ==========================================
    // 3. VEHICLE STATUS MANAGEMENT
    // ==========================================

    function updateVehicleStatus(
        string calldata vehicleId,
        VehicleStatus newStatus,
        string calldata reason
    ) external onlyRole(RTO_AUTHORITY_ROLE) {
        Vehicle storage vehicle = _vehicles[vehicleId];
        if (!vehicle.exists) revert VehicleNotFound(vehicleId);

        VehicleStatus prev = vehicle.status;
        vehicle.status = newStatus;

        if (newStatus != VehicleStatus.ACTIVE) {
            uint256 activeReq = _activeTransferByVehicle[vehicleId];
            if (activeReq != 0) {
                TransferRequest storage req = _transferRequests[activeReq];
                if (req.status == TransferStatus.PENDING_BUYER || req.status == TransferStatus.PENDING_AUTHORITY) {
                    req.status = TransferStatus.CANCELLED;
                    req.rejectionReason = "Vehicle suspended or deregistered by authority";
                    _activeTransferByVehicle[vehicleId] = 0;
                }
            }
        }

        emit VehicleStatusUpdated(vehicleId, prev, newStatus, reason, block.timestamp);
    }

    // ==========================================
    // 4. VIEW / AUDIT / VERIFICATION FUNCTIONS
    // ==========================================

    function getVehicle(string calldata vehicleId) external view returns (Vehicle memory) {
        if (!_vehicles[vehicleId].exists) revert VehicleNotFound(vehicleId);
        return _vehicles[vehicleId];
    }

    function getVehicleByRegistration(string calldata registrationNumber) external view returns (Vehicle memory) {
        string memory vehicleId = _regNumberToVehicleId[registrationNumber];
        if (bytes(vehicleId).length == 0) revert VehicleNotFound(registrationNumber);
        return _vehicles[vehicleId];
    }

    function getOwnershipHistory(string calldata vehicleId)
        external
        view
        returns (OwnershipRecord[] memory)
    {
        if (!_vehicles[vehicleId].exists) revert VehicleNotFound(vehicleId);
        return _ownershipHistories[vehicleId];
    }

    function getTransferRequest(uint256 requestId)
        external
        view
        returns (TransferRequest memory)
    {
        if (!_transferRequests[requestId].exists) revert TransferRequestNotFound(requestId);
        return _transferRequests[requestId];
    }

    function getActiveTransferForVehicle(string calldata vehicleId)
        external
        view
        returns (uint256)
    {
        return _activeTransferByVehicle[vehicleId];
    }

    function getVehicleTransferRequests(string calldata vehicleId)
        external
        view
        returns (uint256[] memory)
    {
        return _vehicleTransferRequests[vehicleId];
    }

    function isDocumentHashValid(
        string calldata vehicleId,
        string calldata docHash
    ) external view returns (bool) {
        if (!_vehicles[vehicleId].exists) return false;
        bytes32 target = keccak256(bytes(docHash));

        // Check initial document
        if (keccak256(bytes(_vehicles[vehicleId].initialDocHash)) == target) {
            return true;
        }

        // Check ownership history documents
        OwnershipRecord[] storage records = _ownershipHistories[vehicleId];
        for (uint256 i = 0; i < records.length; i++) {
            if (keccak256(bytes(records[i].documentHash)) == target) {
                return true;
            }
        }

        return false;
    }

    function totalVehicles() external view returns (uint256) {
        return _vehicleIds.length;
    }

    function getAllVehicleIds() external view returns (string[] memory) {
        return _vehicleIds;
    }

    function totalTransferRequests() external view returns (uint256) {
        return _transferRequestCounter;
    }
}
