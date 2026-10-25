import { ethers, Contract, JsonRpcProvider, Wallet } from "ethers";
import fs from "fs";
import path from "path";
import { config } from "../config/env";

export class BlockchainService {
  private static provider: JsonRpcProvider | null = null;
  private static authorityWallet: Wallet | null = null;
  private static contract: Contract | null = null;
  private static contractAddress: string = "";

  static async init(): Promise<void> {
    try {
      this.provider = new JsonRpcProvider(config.rpcUrl);
      this.authorityWallet = new Wallet(config.authorityPrivateKey, this.provider);

      // Resolve contract address
      let address = config.contractAddress;
      if (!address) {
        const deploymentPath = path.resolve(
          __dirname,
          "../../../blockchain/deployments/VehicleRegistry.json"
        );
        if (fs.existsSync(deploymentPath)) {
          const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
          address = deploymentData.address;
        }
      }

      this.contractAddress = address;

      const abiPath = path.resolve(__dirname, "../blockchain/VehicleRegistry.json");
      if (fs.existsSync(abiPath) && address) {
        const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
        this.contract = new Contract(address, contractJson.abi, this.authorityWallet);
        console.log(`BlockchainService initialized with contract at: ${address}`);
      } else {
        console.warn(
          `BlockchainService: Contract address not set or ABI not found. Blockchain writes will wait for deployment.`
        );
      }
    } catch (err: any) {
      console.warn("BlockchainService initialization warning:", err.message);
    }
  }

  static getContract(): Contract | null {
    return this.contract;
  }

  static getContractAddress(): string {
    return this.contractAddress;
  }

  static async registerVehicleOnChain(params: {
    vehicleId: string;
    registrationNumber: string;
    vinHash: string;
    manufacturer: string;
    model: string;
    year: number;
    vehicleType: string;
    initialOwner: string;
    initialDocHash: string;
    ipfsDocCID: string;
  }): Promise<{ txHash: string; blockNumber: number }> {
    if (!this.contract) {
      await this.init();
      if (!this.contract) {
        throw new Error(
          "Smart contract not deployed or connected. Please deploy the contract first."
        );
      }
    }

    const tx = await this.contract.registerVehicle(
      params.vehicleId,
      params.registrationNumber,
      params.vinHash,
      params.manufacturer,
      params.model,
      params.year,
      params.vehicleType,
      params.initialOwner,
      params.initialDocHash,
      params.ipfsDocCID
    );

    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  static async respondTransferAsAuthorityOnChain(
    requestId: number,
    approve: boolean,
    rejectionReason: string = ""
  ): Promise<{ txHash: string; blockNumber: number }> {
    if (!this.contract) {
      await this.init();
      if (!this.contract) {
        throw new Error("Smart contract not connected");
      }
    }

    const tx = await this.contract.respondTransferAsAuthority(
      requestId,
      approve,
      rejectionReason
    );
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  static async updateVehicleStatusOnChain(
    vehicleId: string,
    newStatus: 0 | 1 | 2, // 0: ACTIVE, 1: SUSPENDED, 2: DEREGISTERED
    reason: string
  ): Promise<{ txHash: string }> {
    if (!this.contract) {
      await this.init();
      if (!this.contract) throw new Error("Smart contract not connected");
    }

    const tx = await this.contract.updateVehicleStatus(vehicleId, newStatus, reason);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  static async getVehicleOnChain(vehicleId: string): Promise<any> {
    if (!this.contract) return null;
    try {
      return await this.contract.getVehicle(vehicleId);
    } catch {
      return null;
    }
  }

  static async getOwnershipHistoryOnChain(vehicleId: string): Promise<any[]> {
    if (!this.contract) return [];
    try {
      const records = await this.contract.getOwnershipHistory(vehicleId);
      return records.map((r: any) => ({
        owner: r.owner,
        transferTimestamp: Number(r.transferTimestamp),
        transferRequestId: Number(r.transferRequestId),
        documentHash: r.documentHash,
      }));
    } catch {
      return [];
    }
  }

  static async isDocumentHashValidOnChain(
    vehicleId: string,
    docHash: string
  ): Promise<boolean> {
    if (!this.contract) return false;
    try {
      return await this.contract.isDocumentHashValid(vehicleId, docHash);
    } catch {
      return false;
    }
  }
}
