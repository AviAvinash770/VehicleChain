import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying VehicleRegistry with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const VehicleRegistryFactory = await ethers.getContractFactory("VehicleRegistry");
  const vehicleRegistry = await VehicleRegistryFactory.deploy(deployer.address);
  await vehicleRegistry.waitForDeployment();

  const contractAddress = await vehicleRegistry.getAddress();
  console.log("VehicleRegistry deployed successfully to:", contractAddress);

  // Save deployed address and ABI to backend and frontend configs
  const deploymentInfo = {
    address: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const sharedConfigDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(sharedConfigDir)) {
    fs.mkdirSync(sharedConfigDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(sharedConfigDir, "VehicleRegistry.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to:", path.join(sharedConfigDir, "VehicleRegistry.json"));
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
