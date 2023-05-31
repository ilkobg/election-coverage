import { USElection__factory } from "./../typechain-types/factories/Election.sol/USElection__factory";
import { USElection } from "./../typechain-types/Election.sol/USElection";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("USElection", function () {
  let usElectionFactory;
  let usElection: USElection;

  async function deployFixture() {
    usElectionFactory = await ethers.getContractFactory("USElection");

    usElection = await usElectionFactory.deploy();

    await usElection.deployed();
  }

  before(async () => {
    await loadFixture(deployFixture);
  });

  it("Should return the current leader before submit any election results", async function () {
    expect(await usElection.currentLeader()).to.equal(0); // NOBODY
  });

  it("Should return the election status", async function () {
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults = ["California", 1000, 900, 32];

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(1); // BIDEN
  });

  it("Should throw when try to submit already submitted state results", async function () {
    const stateResults = ["California", 1000, 900, 32];

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "This state result was already submitted!"
    );
  });

  it("Should throw when try to submit equeal results", async function () {
    const stateResults = ["California", 1000, 1000, 32];

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "Can not have a tie!"
    );
  });

  it("Should throw when try to submit results with zero state seats", async function () {
    const stateResults = ["California", 1000, 900, 0];

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "States must have at least 1 seat!"
    );
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults = ["Ohaio", 800, 1200, 33];

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP
  });

  it("Should throw on trying to submit state results with not the owner", async function () {
    const stateResults = ["Ohaio", 800, 1200, 33];
    const [owner, addr1] = await ethers.getSigners();

    expect(usElection.connect(addr1).submitStateResult(stateResults)).to.be.revertedWith("Ownable: Caller is not the owner");
  });

  it("Should throw on trying to submit state results when elections have ended", async function () {
    const stateResults = ["Ohaio", 800, 1200, 33];
    const endElectionTx = await usElection.endElection();

    await endElectionTx.wait();

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("Elections have ended");
  });


  it("Should end the elections, get the leader and election status", async function () {
    await loadFixture(deployFixture);

    const stateResults = ["California", 1000, 1200, 32];
    const submitStateResultsTx = await usElection.submitStateResult(stateResults);
    await submitStateResultsTx.wait();

    const endElectionTx = await usElection.endElection();
    await endElectionTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP

    expect(await usElection.electionEnded()).to.equal(true); // Ended
  });

  it("Should throw on trying to end election with not the owner", async function () {
    await loadFixture(deployFixture);
    const [owner, addr1] = await ethers.getSigners();

    await usElection.connect(addr1).electionEnded();

    expect(usElection.connect(addr1).endElection()).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should throw on trying to end election when elections are already ended", async function () {
    await loadFixture(deployFixture);

    expect(await usElection.electionEnded()).to.equal(false);

    const endElectionTx = await usElection.endElection();
    await endElectionTx.wait()
    await usElection.electionEnded();

    expect(await usElection.electionEnded()).to.equal(true);

    expect(usElection.endElection()).to.be.revertedWith('Elections already ended');
  });

});
