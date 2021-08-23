const hre = require("hardhat");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function main() {
  const tokenSupplyLimit = 10000;
  const tokenBaseUri = "CanineCartel";
  
  const CanineCartel = await hre.ethers.getContractFactory("CanineCartel");
  const canineCartel = await CanineCartel.deploy(tokenSupplyLimit, tokenBaseUri);

  await canineCartel.deployed();

  console.log("CanineCartel deployed to:", canineCartel.address);

  await sleep(20);
  await hre.run("verify:verify", {
    address: canineCartel.address,
    contract: "contracts/CanineCartel.sol:CanineCartel",
    constructorArguments: [tokenSupplyLimit, tokenBaseUri],
  })

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
