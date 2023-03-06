import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import logo from "./logo.png";
import Blockies from "react-blockies";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [chainId, setChainId] = useState();
  const [contractAddress, setContractAddress] = useState();
  const [currentAccountBalance, setCurrentAccountBalance] = useState();
  const [escrowStatus, setEscrowStatus] = useState();

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("deployed")) === "yes") {
      // setBeneficiary(JSON.parse(localStorage.getItem("beneficiary")));
      document.getElementById("beneficiary").value = JSON.parse(
        localStorage.getItem("beneficiary")
      );

      //  setBeneficiary(JSON.parse(localStorage.getItem("arbiter")));
      document.getElementById("arbiter").value = JSON.parse(
        localStorage.getItem("arbiter")
      );

      //  setBeneficiary(JSON.parse(localStorage.getItem("value")));
      document.getElementById("wei").value = JSON.parse(
        localStorage.getItem("value")
      );
    }

    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());

      const myEth = await parseInt(
        (
          await provider.getBalance(accounts[0])
        )._hex
      );

      const parsedEth = myEth * Math.pow(10, -18);
      setCurrentAccountBalance(parseFloat(parsedEth.toFixed(5)));
    }

    const checkIfAccountChanged = async () => {
      try {
        const { ethereum } = window;
        ethereum.on("accountsChanged", (accounts) => {
          console.log("Account changed to:", accounts[0]);
          getAccounts();
        });
      } catch (error) {
        console.log(error);
      }
    };
    getAccounts();
    checkIfAccountChanged();
  }, [account, chainId]);

  async function newContract() {
    let value = document.getElementById("wei").value;
    value = (value * 1000000000000000000).toString();
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;

    localStorage.setItem("arbiter", JSON.stringify(arbiter));
    localStorage.setItem("beneficiary", JSON.stringify(beneficiary));
    localStorage.setItem("value", JSON.stringify(value / Math.pow(10, 18)));

    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    setContractAddress(escrowContract.address);
    setEscrowStatus(await escrowContract.statusEscrow());
    console.log("Contract Address:", escrowContract.address);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value,
      handleApprove: async () => {
        escrowContract.on("Approved", () => {
          document.getElementById(escrowContract.address).className =
            "complete";
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
    setContractAddress(escrowContract.address);
    setChainId(provider.network.chainId);
  }

  return (
    <>
      <div class="navbar">
        <span class="logo-span">
          <img src={logo} alt="" />
        </span>
        <span class="account-info">
          <span class="connected-address">
            <Blockies
              seed={account}
              size={8}
              scale={3.5}
              color="#2187D0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
              className="identicon"
            />
            {account &&
              account.slice(0, 5) + "..." + (account && account.slice(38, 42))}
          </span>
          <span class="account-balance">
            <h5>ETH Balance: </h5>
            {currentAccountBalance}
          </span>
        </span>
      </div>
      <h1 class="app-title">Welcome to Escrow Dapp</h1>
      <div class="contents">
        <div className="contract">
          <h1 class="new-contract"> New Contract </h1>
          <label>
            Arbiter Address
            <input type="text" id="arbiter" placeholder="0x..." />
          </label>

          <label>
            Beneficiary Address
            <input type="text" id="beneficiary" placeholder="0x..." />
          </label>

          <label>
            Deposit Amount (in ETH)
            <input type="text" id="wei" placeholder="Amount" />
          </label>

          <div
            className="button"
            id="deploy"
            onClick={(e) => {
              e.preventDefault();

              newContract();
            }}
          >
            Deploy
          </div>
        </div>

        <div className="existing-contracts">
          <h1> Existing Contracts </h1>

          <div id="container">
            {escrows.map((escrow) => {
              return (
                <Escrow
                  key={escrow.address}
                  {...escrow}
                  contractAddress={contractAddress}
                  chainId={chainId}
                  escrowStatus={escrowStatus}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
