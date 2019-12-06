var NoteHash = artifacts.require("./NoteHash.sol");

module.exports = function(deployer) {
  deployer.deploy(NoteHash);
};
