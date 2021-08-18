const hre = require("hardhat");

async function main() {
  const tokenSupplyLimit = 30000;
  const tokenBaseUri = "CanineCartel";
  
  const CanineCartel = await hre.ethers.getContractFactory("CanineCartel");
  const canineCartel = await CanineCartel.deploy(tokenSupplyLimit, tokenBaseUri);

  await canineCartel.deployed();

  console.log("CanineCartel deployed to:", canineCartel.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
