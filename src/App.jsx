import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abi.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const primaryContractAddress = "0xDb487631767361A0abe6Cc235824d08279B09F16";
const messageContractAddress = "0x32871De03345ECfba742e1BC163E66C2903F7640";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [primaryContract, setPrimaryContract] = useState(null);
  const [messageContract, setMessageContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [userInput, setUserInput] = useState("");
  const [retrievedMessage, setRetrievedMessage] = useState("");

  useEffect(() => {
    const initializeEthers = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const _provider = new ethers.BrowserProvider(window.ethereum);
          const _signer = await _provider.getSigner();

          const _primaryContract = new ethers.Contract(
            primaryContractAddress,
            abi,
            _signer
          );
          const _messageContract = new ethers.Contract(
            messageContractAddress,
            abi,
            _signer
          );

          setProvider(_provider);
          setSigner(_signer);
          setPrimaryContract(_primaryContract);
          setMessageContract(_messageContract);
          toast.success("MetaMask connected successfully!");
        } catch (error) {
          toast.error("Failed to connect to MetaMask.");
          console.error(error);
        }
      } else {
        toast.error("Please install MetaMask to use this application.");
      }
    };
    initializeEthers();
  }, []);

  const getBalance = async () => {
    if (primaryContract) {
      try {
        const _balance = await primaryContract.getBalance();
        setBalance(ethers.formatEther(_balance));
        toast.success(`Balance fetched successfully: ${ethers.formatEther(_balance)} ETH`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch balance.");
      }
    }
  };

  const deposit = async () => {
    if (primaryContract && amount) {
      try {
        const tx = await primaryContract.deposit(ethers.parseEther(amount), {
          value: ethers.parseEther(amount),
        });
        await tx.wait();
        toast.success("Deposit successful!");
        getBalance();
      } catch (error) {
        console.error(error);
        toast.error("Deposit failed!");
      }
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

  const withdraw = async () => {
    if (primaryContract && amount) {
      try {
        const tx = await primaryContract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        toast.success("Withdrawal successful!");
        getBalance();
      } catch (error) {
        console.error(error);
        if (error.code === "CALL_EXCEPTION") {
          toast.error("Insufficient balance for withdrawal.");
        } else {
          toast.error("Withdrawal failed!");
        }
      }
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

  const setUserMessage = async () => {
    if (messageContract) {
      try {
        const tx = await messageContract.setMessage(userInput);
        await tx.wait();
        toast.success("Message set successfully!");
      } catch (error) {
        console.error("Failed to set message:", error);
        toast.error("Failed to set message.");
      }
    }
  };

  const getUserMessage = async () => {
    if (messageContract) {
      try {
        const message = await messageContract.getMessage();
        setRetrievedMessage(message);
        toast.success("Message retrieved successfully!");
      } catch (error) {
        console.error("Failed to retrieve message:", error);
        toast.error("Failed to retrieve message.");
      }
    }
  };

  return (
    <div className="App">
      <h1>DApp Functions</h1>

      <div className="contract-section">
        <button onClick={getBalance}>Get Balance</button>
        <p>Contract Balance: {balance} ETH</p>

        <input
          type="number"
          placeholder="Enter amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
