//specifying solidity version to the compiler
pragma solidity ^0.5.0;


// declaring the contract
contract FileHash {
    
    //unique ID for each note that is stored on the blockchain
    uint256 noteId = 0;
    
    //structure of data containing the borrower address and the note's IPFS hash
    struct data{
        address borrower;
        string hash;
    }
    
    //mapping the note's data to the unique ID
    mapping(uint256 => data) public notesdata;
    
    //function to add a IPFS hash of the Note to the blockchain
    function addhash(string memory _hash) public returns( uint256 _noteId){
    
    noteId++;                                       
    notesdata[noteId] = data(msg.sender, _hash);        // adding the borrower address and the note's IPFS hash to the struct and mapping

    
    return noteId;                                  // retruning the noteId to the client 
    }
    
    
    // function to view who is the borrower and respective note's IPFS address of a noteId
    function showhash(uint256 _noteId) public view returns(address _borrower, string memory _hash ) {
        
        return (notesdata[_noteId].borrower, notesdata[_noteId].hash);
    }
}
