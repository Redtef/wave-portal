import { ethers } from "ethers";
import * as React from "react";
import { useEffect, useState } from "react";
import abi from "./utils/WavePortal.json";
// import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [allWaves, setAllWaves] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [inputValue, setInputValue] = useState("");
  const contractAddress = "0x4313F4f08b9D5D06F970D97fe59121FAF721b9b7";
  const contractABI = abi.abi;

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("You need to connect to your metamask!");
      } else {
        console.log("eth object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("we got him boss: ", account);
        getAllWaves();
        setCurrentAccount(account);
      } else {
        console.log("we found nothing boss");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("You need an ethereum wallet!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      getAllWaves();
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Fetched total wave count : ", count.toNumber());

        const waveTxn = await wavePortalContract.wave(inputValue, {
          gasLimit: 300000,
        });
        console.log("waveTXN hash : ", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.error("Ethereum object doesnt exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderConnectedContainer = () => {
    return (
      <div>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            wave();
          }}
        >
          <input
            type="text"
            id="message"
            placeholder="Enter a message!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="waveButton">
            Wave at Me
          </button>
        </form>
      </div>
    );
  };
  useEffect(() => {
    isWalletConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Wave">
            👋
          </span>
          gm !
        </div>
        <div className="bio">
          I am Hamza and I am a fullstack SWE currently learning alot about web3
          on @_Buildspace !<br></br>
          Connect you metamask wallet to wave at me !
        </div>
        {currentAccount && renderConnectedContainer()}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
