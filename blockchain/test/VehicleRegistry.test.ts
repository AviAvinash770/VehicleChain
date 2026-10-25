import { expect } from "chai";
import { ethers } from "hardhat";
import { VehicleRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VehicleRegistry Smart Contract Tests", function () {
  let vehicleRegistry: VehicleRegistry;
  let admin: SignerWithAddress;
  let rtoAuthority: SignerWithAddress;
  let owner1: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let stranger: SignerWithAddress;

  const VEHICLE_ID = "VEH-2026-000001";
  const REG_NUMBER = "AP 39 AB 2026";
  const VIN_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const INITIAL_DOC_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  const IPFS_DOC_CID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

  beforeEach(async function () {
    [admin, rtoAuthority, owner1, buyer1, stranger] = await ethers.getSigners();

    const VehicleRegistryFactory = await ethers.getContractFactory("VehicleRegistry");
    vehicleRegistry = await VehicleRegistryFactory.deploy(rtoAuthority.address);
    await vehicleRegistry.waitForDeployment();
  });

  describe("1. Roles and Deployment", function () {
    it("Should grant RTO_AUTHORITY_ROLE to deployer and specified authority", async function () {
      const RTO_ROLE = await vehicleRegistry.RTO_AUTHORITY_ROLE();
      expect(await vehicleRegistry.hasRole(RTO_ROLE, admin.address)).to.be.true;
      expect(await vehicleRegistry.hasRole(RTO_ROLE, rtoAuthority.address)).to.be.true;
      expect(await vehicleRegistry.hasRole(RTO_ROLE, stranger.address)).to.be.false;
    });
  });

  describe("2. Vehicle Registration", function () {
    it("Should allow authorized RTO authority to register a vehicle", async function () {
      await expect(
        vehicleRegistry.connect(rtoAuthority).registerVehicle(
          VEHICLE_ID,
          REG_NUMBER,
          VIN_HASH,
          "Tata Motors",
          "Nexon EV",
          2024,
          "Electric SUV",
          owner1.address,
          INITIAL_DOC_HASH,
          IPFS_DOC_CID
        )
      )
        .to.emit(vehicleRegistry, "VehicleRegistered")
        .withArgs(VEHICLE_ID, REG_NUMBER, owner1.address, VIN_HASH, (val: any) => val > 0);

      const vehicle = await vehicleRegistry.getVehicle(VEHICLE_ID);
      expect(vehicle.vehicleId).to.equal(VEHICLE_ID);
      expect(vehicle.registrationNumber).to.equal(REG_NUMBER);
      expect(vehicle.currentOwner).to.equal(owner1.address);
      expect(vehicle.status).to.equal(0); // VehicleStatus.ACTIVE

      const history = await vehicleRegistry.getOwnershipHistory(VEHICLE_ID);
      expect(history.length).to.equal(1);
      expect(history[0].owner).to.equal(owner1.address);
      expect(history[0].documentHash).to.equal(INITIAL_DOC_HASH);
    });

    it("Should reject duplicate vehicle registration (same vehicleId)", async function () {
      await vehicleRegistry.connect(rtoAuthority).registerVehicle(
        VEHICLE_ID,
        REG_NUMBER,
        VIN_HASH,
        "Tata Motors",
        "Nexon EV",
        2024,
        "Electric SUV",
        owner1.address,
        INITIAL_DOC_HASH,
        IPFS_DOC_CID
      );

      await expect(
        vehicleRegistry.connect(rtoAuthority).registerVehicle(
          VEHICLE_ID,
          "DL 1C A 9999",
          "different_vin_hash",
          "Tata Motors",
          "Nexon EV",
          2024,
          "Electric SUV",
          owner1.address,
          INITIAL_DOC_HASH,
          IPFS_DOC_CID
        )
      ).to.be.revertedWithCustomError(vehicleRegistry, "VehicleAlreadyExists");
    });

    it("Should reject registration if registration number or VIN already exists", async function () {
      await vehicleRegistry.connect(rtoAuthority).registerVehicle(
        VEHICLE_ID,
        REG_NUMBER,
        VIN_HASH,
        "Tata Motors",
        "Nexon EV",
        2024,
        "Electric SUV",
        owner1.address,
        INITIAL_DOC_HASH,
        IPFS_DOC_CID
      );

      // Same Reg Number
      await expect(
        vehicleRegistry.connect(rtoAuthority).registerVehicle(
          "VEH-2026-000002",
          REG_NUMBER,
          "another_vin",
          "Tata Motors",
          "Nexon EV",
          2024,
          "Electric SUV",
          owner1.address,
          INITIAL_DOC_HASH,
          IPFS_DOC_CID
        )
      ).to.be.revertedWithCustomError(vehicleRegistry, "RegNumberAlreadyExists");

      // Same VIN Hash
      await expect(
        vehicleRegistry.connect(rtoAuthority).registerVehicle(
          "VEH-2026-000003",
          "DL 1C A 1111",
          VIN_HASH,
          "Tata Motors",
          "Nexon EV",
          2024,
          "Electric SUV",
          owner1.address,
          INITIAL_DOC_HASH,
          IPFS_DOC_CID
        )
      ).to.be.revertedWithCustomError(vehicleRegistry, "VinAlreadyExists");
    });

    it("Should reject vehicle registration by unauthorized callers", async function () {
      await expect(
        vehicleRegistry.connect(stranger).registerVehicle(
          VEHICLE_ID,
          REG_NUMBER,
          VIN_HASH,
          "Tata Motors",
          "Nexon EV",
          2024,
          "Electric SUV",
          owner1.address,
          INITIAL_DOC_HASH,
          IPFS_DOC_CID
        )
      ).to.be.reverted;
    });
  });

  describe("3. Ownership Transfer Workflow", function () {
    const TRANSFER_DOC_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    const TRANSFER_IPFS = "QmZtmD2qt8fJpq3CLDHcg53432BhyKxJJzbTrKnYs45vpH";

    beforeEach(async function () {
      await vehicleRegistry.connect(rtoAuthority).registerVehicle(
        VEHICLE_ID,
        REG_NUMBER,
        VIN_HASH,
        "Tata Motors",
        "Nexon EV",
        2024,
        "Electric SUV",
        owner1.address,
        INITIAL_DOC_HASH,
        IPFS_DOC_CID
      );
    });

    it("Should allow current owner to initiate transfer to buyer", async function () {
      await expect(
        vehicleRegistry.connect(owner1).initiateTransfer(
          VEHICLE_ID,
          buyer1.address,
          TRANSFER_DOC_HASH,
          TRANSFER_IPFS
        )
      )
        .to.emit(vehicleRegistry, "TransferInitiated")
        .withArgs(1, VEHICLE_ID, owner1.address, buyer1.address, TRANSFER_DOC_HASH, (val: any) => val > 0);

      const req = await vehicleRegistry.getTransferRequest(1);
      expect(req.currentOwner).to.equal(owner1.address);
      expect(req.buyer).to.equal(buyer1.address);
      expect(req.status).to.equal(1); // TransferStatus.PENDING_BUYER
    });

    it("Should reject transfer initiation from non-owner", async function () {
      await expect(
        vehicleRegistry.connect(stranger).initiateTransfer(
          VEHICLE_ID,
          buyer1.address,
          TRANSFER_DOC_HASH,
          TRANSFER_IPFS
        )
      ).to.be.revertedWithCustomError(vehicleRegistry, "NotVehicleOwner");
    });

    it("Should reject transfer if vehicle is suspended", async function () {
      await vehicleRegistry.connect(rtoAuthority).updateVehicleStatus(
        VEHICLE_ID,
        1, // SUSPENDED
        "Challan unpaid"
      );

      await expect(
        vehicleRegistry.connect(owner1).initiateTransfer(
          VEHICLE_ID,
          buyer1.address,
          TRANSFER_DOC_HASH,
          TRANSFER_IPFS
        )
      ).to.be.revertedWithCustomError(vehicleRegistry, "VehicleNotActive");
    });

    it("Should prevent duplicate pending transfer requests for the same vehicle", async function () {
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );

      await expect(
        vehicleRegistry.connect(owner1).initiateTransfer(
          VEHICLE_ID,
          buyer1.address,
          TRANSFER_DOC_HASH,
          TRANSFER_IPFS
        )
      ).to.be.revertedWithCustomError(vehicleRegistry, "TransferAlreadyPending");
    });

    it("Should allow buyer to accept transfer request", async function () {
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );

      await expect(
        vehicleRegistry.connect(buyer1).respondTransferAsBuyer(1, true, "")
      )
        .to.emit(vehicleRegistry, "TransferRespondedByBuyer")
        .withArgs(1, VEHICLE_ID, buyer1.address, true, "", (val: any) => val > 0);

      const req = await vehicleRegistry.getTransferRequest(1);
      expect(req.status).to.equal(2); // TransferStatus.PENDING_AUTHORITY
    });

    it("Should reject buyer response from unauthorized user", async function () {
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );

      await expect(
        vehicleRegistry.connect(stranger).respondTransferAsBuyer(1, true, "")
      ).to.be.revertedWithCustomError(vehicleRegistry, "NotTargetBuyer");
    });

    it("Should allow buyer to reject transfer request with reason", async function () {
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );

      await vehicleRegistry.connect(buyer1).respondTransferAsBuyer(1, false, "Price mismatch");

      const req = await vehicleRegistry.getTransferRequest(1);
      expect(req.status).to.equal(4); // TransferStatus.REJECTED
      expect(req.rejectionReason).to.equal("Price mismatch");

      // Active transfer is cleared so owner can initiate again if needed
      expect(await vehicleRegistry.getActiveTransferForVehicle(VEHICLE_ID)).to.equal(0);
    });

    it("Complete workflow: Buyer accepts, Authority approves, ownership updates", async function () {
      // 1. Owner initiates
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );

      // 2. Buyer accepts
      await vehicleRegistry.connect(buyer1).respondTransferAsBuyer(1, true, "");

      // 3. Authority approves
      await expect(
        vehicleRegistry.connect(rtoAuthority).respondTransferAsAuthority(1, true, "")
      )
        .to.emit(vehicleRegistry, "TransferApprovedByAuthority")
        .withArgs(1, VEHICLE_ID, owner1.address, buyer1.address, (val: any) => val > 0);

      // Check state
      const req = await vehicleRegistry.getTransferRequest(1);
      expect(req.status).to.equal(5); // TransferStatus.COMPLETED

      const vehicle = await vehicleRegistry.getVehicle(VEHICLE_ID);
      expect(vehicle.currentOwner).to.equal(buyer1.address);

      // Check ownership history
      const history = await vehicleRegistry.getOwnershipHistory(VEHICLE_ID);
      expect(history.length).to.equal(2);
      expect(history[0].owner).to.equal(owner1.address);
      expect(history[1].owner).to.equal(buyer1.address);
      expect(history[1].transferRequestId).to.equal(1);
      expect(history[1].documentHash).to.equal(TRANSFER_DOC_HASH);
    });

    it("Should reject non-authority caller attempting to approve transfer", async function () {
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );
      await vehicleRegistry.connect(buyer1).respondTransferAsBuyer(1, true, "");

      await expect(
        vehicleRegistry.connect(stranger).respondTransferAsAuthority(1, true, "")
      ).to.be.reverted;
    });

    it("Should allow authority to reject transfer with reason without changing owner", async function () {
      await vehicleRegistry.connect(owner1).initiateTransfer(
        VEHICLE_ID,
        buyer1.address,
        TRANSFER_DOC_HASH,
        TRANSFER_IPFS
      );
      await vehicleRegistry.connect(buyer1).respondTransferAsBuyer(1, true, "");

      await vehicleRegistry.connect(rtoAuthority).respondTransferAsAuthority(1, false, "Document forgery detected");

      const req = await vehicleRegistry.getTransferRequest(1);
      expect(req.status).to.equal(4); // TransferStatus.REJECTED
      expect(req.rejectionReason).to.equal("Document forgery detected");

      // Owner remains owner1
      const vehicle = await vehicleRegistry.getVehicle(VEHICLE_ID);
      expect(vehicle.currentOwner).to.equal(owner1.address);
    });
  });

  describe("4. Document Integrity Verification", function () {
    beforeEach(async function () {
      await vehicleRegistry.connect(rtoAuthority).registerVehicle(
        VEHICLE_ID,
        REG_NUMBER,
        VIN_HASH,
        "Tata Motors",
        "Nexon EV",
        2024,
        "Electric SUV",
        owner1.address,
        INITIAL_DOC_HASH,
        IPFS_DOC_CID
      );
    });

    it("Should verify registered document hashes and reject untrusted hashes", async function () {
      expect(await vehicleRegistry.isDocumentHashValid(VEHICLE_ID, INITIAL_DOC_HASH)).to.be.true;
      expect(await vehicleRegistry.isDocumentHashValid(VEHICLE_ID, "fake_modified_document_hash")).to.be.false;
    });
  });
});
