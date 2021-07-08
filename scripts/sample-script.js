const hre = require("hardhat");

async function main() {
  const ownerAddress = "";
  const devAddress = "";
  const marketingAddress = "";
  
  const CanineCartel = await hre.ethers.getContractFactory("CanineCartel");
  const canineCartel = await CanineCartel.deploy(ownerAddress, devAddress, marketingAddress);

  await canineCartel.deployed();

  console.log("CanineCartel deployed to:", canineCartel.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
