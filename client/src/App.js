import React, { Component } from "react";
import NoteHash from "./contracts/NoteHash.json";
import getWeb3 from "./utils/getWeb3";
import { Buffer } from 'buffer';
import "./App.css";


//------- STEP 0 : improting IPFS Client & setting up the HOST and PORT ----------//
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({
  host: 'localhost', port: '5001', protocol: 'http'
})


class App extends Component {

  //----------State variable ----stores Data Globally -----------------------//
  state = { hash : null, buffer : null, storageValue: 0, 
            web3: null, accounts: null, contract: null,
            gethash : null, borrower : null, url:null,
            furl:null };


  //-------- STEP 0 : First Funtions that executes on page load ---------------------//
  //-------- STEP 0 :  Connecting REACT to GANACHE usinf WEB3 ---------------------//
  componentDidMount = async () => {
          try {
        // Get network provider and web3 instance.
        // Use web3 to get the user's accounts.
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();

       // ---------------- Replace the Below Contract network ID with 'FileHash' -------
            const deployedNetwork = NoteHash.networks[networkId];
            
      // -----------------  Initalising Contract 'Instance' ---------------------------
            const instance = new web3.eth.Contract(
              NoteHash.abi,
            deployedNetwork && deployedNetwork.address,
            );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
            this.setState({ web3, accounts, contract: instance });
          } catch (error) {
      // Catch any errors for any of the above operations.
            alert(
              `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
          }
  }



 // -----------Example Function to Set and Get SimpleStorage Contract ------//
  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    //await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();
    
    // Update state with the result.
    this.setState({ storageValue: response });
  }

  
// ------------Step 1.1 selecting File and Converting to Buffer------------//
  onChange = (event) => {
  
  event.preventDefault()
  console.log("file caputred")
  
  const file = event.target.files[0]
  const reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => {
    this.setState({ buffer : Buffer(reader.result)}
    )
  };
  
  }


// ------------Step 1.2 uploading File to IPFS and Storing Hash------
  submitfile = (event) => {

  event.preventDefault()
  console.log("submitting to IPFS")
  
  console.log("buffer reprensntation ", Buffer(this.state.buffer))
  ipfs.add(this.state.buffer, (error, result)=> {
  console.log("ipfs Results", result)
  this.setState(  { hash : result[0].hash })
  console.log("hash is :",this.state.hash)
    if(error){
      console.error(error)
      return
    }
  }) 


  }


// ------------Step 2  Adding the HASH to Blockchain -----------------//
  addtoblochchain = async () => {
    const { accounts, contract } = this.state;
    const result = await contract.methods.addhash(this.state.hash).send({ from: accounts[0] });
    console.log(" Response from BlockChain",result)
  };


// ------------Step 3  Retreving the Borrower address and Hash of a NOTE -----------------//
myChangeHandler = (event) => {
  this.setState({gethash: event.target.value});
};

returnHash = async () => {
 
  const { contract } = this.state;
  const response = await contract.methods.showhash(this.state.gethash).call();
  this.setState({ borrower : response[0] })
  this.setState({ url : response[1] })
  const s = "http://ipfs.io/ipfs//";
  this.setState({ furl : s+response[1] }) 

};






//------------- Front End UI Elements are Displayed by render() -----------
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
    return (
   <div className="App">
       
       <div><h2> Decentralised Promissorynote Application </h2></div>
     
            <div>
                <form onSubmit={this.submitfile}>
                <input type = 'file' onChange = {this.onChange} ></input>
                <input type = 'submit' ></input>
                </form>
                <div>the hash of the file is : {this.state.hash}</div>
            </div>
    



         <div>
             <button onClick = { this.addtoblochchain}>Add to blockchain</button>  
          </div>
    

        <div>
          <h3>Enter Note ID: {this.state.gethash}</h3>
          <input type='text' onChange = { this.myChangeHandler} /> 
          <button onClick = { this.returnHash}>Get deatils of Note Id</button>  
          <div>borrower of this noteID is :<strong> {this.state.borrower}</strong></div>
          <div>URL of the NOTE is  <strong>" http://ipfs.io/ipfs//{this.state.url}  "</strong></div>  
          <div><a href={this.state.furl} target="_blank">open Note</a></div>
        </div>
    
     </div>
    );
  }
}

export default App;
