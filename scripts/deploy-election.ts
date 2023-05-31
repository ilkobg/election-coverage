import { ethers } from "hardhat";

export async function main() {
    const US_Election_Factory = await ethers.getContractFactory("USElection");
    const usElection = await US_Election_Factory.deploy();
    await usElection.deployed();

    console.log(`The Election contract is deployed to ${usElection.address}`);
}