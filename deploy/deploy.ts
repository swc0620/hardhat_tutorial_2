import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SimpleToken } from "../typechain-types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { admin, depositor } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployment = await deploy("SimpleToken", {
    from: admin,
    args: ["SimpleToken", "Simple"],
    log: true,
  });

  const simpleToken = (await hre.ethers.getContractAt(
    deployment.abi,
    deployment.address
  )) as SimpleToken;

  const depositorSigner = await hre.ethers.getSigner(depositor);

  const faucetTx = await simpleToken.connect(depositorSigner).faucet();
  await faucetTx.wait();

  const balance = await simpleToken.balanceOf(depositorSigner.address);

  console.log("Depositor simple token balance:", balance.toString());

  if (hre.network.name != "hardhat") {
    await hre.run("etherscan-verify", {
      network: hre.network.name,
    });
  }
};

export default deploy;