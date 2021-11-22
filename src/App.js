import * as React from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const wave = () => {};

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 gm !</div>

        <div className="bio">
          I am Hamza and I am a fullstack SWE currently learning alot about web3
          on @_Buildspace !<br></br>
          Connect you metamask wallet to wave at me !
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  );
}
