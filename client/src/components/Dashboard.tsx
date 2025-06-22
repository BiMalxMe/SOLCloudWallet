import { useState } from "react";
import { Button } from "./Button";
import axios from "axios";

export const Dashboardd = () => {
  const [walletInfo, setWalletInfo] = useState<null | { publicKey: string; privateKey?: string }>(null);
  const [copyMsg, setCopyMsg] = useState<string>("");
  const [transferRes, setTransferRes] = useState("")
  const [signature, setSignature] = useState("")
  const [checktransaction, setcheckTransaction] = useState("")

  async function handlecheckTransaction() {
    const res = await axios.post(
      `http://localhost:3000/api/v1/txn/?id=${signature}`)
    setcheckTransaction(res.data.msg)
  }

  function handleTransfer() {
    setTransferRes("Transferring");
    const amountInput = document.getElementById("amount") as HTMLInputElement | null;
    const addressInput = document.getElementById("address") as HTMLInputElement | null;
    const amount = amountInput ? amountInput.value : "";
    const toAddress = addressInput ? addressInput.value : "";
    axios.post(
      "http://localhost:3000/api/v1/txn/sign",
      {
        to: toAddress,
        amount: amount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "authorization": `${localStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => {
        alert(`Transaction successful! Signature: ${res.data.sig}`);
        setTransferRes(res.data?.msg)
        setSignature(res.data?.sig)
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.msg) {
          alert(err.response.data.msg);
        } else {
          alert("Transaction failed");
          setTransferRes("")
        }
      });
  }

  async function handlewalletcreation() {
    try {
      const res = await axios.post(
        "http://localhost:3000/createwallet",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${localStorage.getItem("token")}`,
          },
        }
      );
      const data = res.data;
      setWalletInfo({ publicKey: data.publicKey, privateKey: data.privateKey });
      setCopyMsg(""); // reset copy message
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.msg) {
        setWalletInfo(null);
        setCopyMsg("");
        alert(err.response.data.msg || "Failed to create wallet");
      } else {
        setWalletInfo(null);
        setCopyMsg("");
        alert("Error creating wallet");
      }
    }
  }

  const handleCopy = async () => {
    if (walletInfo?.publicKey) {
      try {
        await navigator.clipboard.writeText(walletInfo.publicKey);
        setCopyMsg("Copied!");
        setTimeout(() => setCopyMsg(""), 1200);
      } catch {
        setCopyMsg("Failed to copy");
        setTimeout(() => setCopyMsg(""), 1200);
      }
    }
  };

  return (
    <div className="text-white flex flex-col items-center w-full px-2 sm:px-0">
      <div onClick={handlewalletcreation} className="flex flex-col w-full max-w-md">
        <Button>Create Wallet</Button>
      </div>
      {walletInfo && (
        <div className="w-full max-w-md">
          <div
            className="mt-6 bg-gray-900 border border-gray-400 rounded-lg p-4 cursor-pointer select-all transition hover:bg-gray-800 relative break-words"
            title="Click to copy public key"
            onClick={handleCopy}
          >
            <div className="font-bold text-lg mb-2">Wallet Created!</div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold">Public Key:</span>
              <span className="ml-0 sm:ml-2 break-all text-blue-300 text-sm sm:text-base">{walletInfo.publicKey}</span>
            </div>
            {copyMsg && (
              <div className="absolute top-2 right-4 text-green-400 text-sm font-semibold">
                {copyMsg}
              </div>
            )}
          </div>
          <div className="font-semibold text-green-500 mt-3 text-sm sm:text-base">
            Dont have sol! ???? <a href="https://solfaucet.com/" target="_blank" rel="noopener noreferrer" className="underline">Click</a>
          </div>
        </div>
      )}
      <div className="mt-4 w-full max-w-md">
        <div className="flex flex-col sm:flex-row mb-3 gap-3 w-full">
          <input
            id="address"
            type="text"
            placeholder="Recipient Address"
            className="px-4 py-2 rounded border border-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
          <input
            id="amount"
            type="number"
            placeholder="Amount (SOL)"
            className="px-4 py-2 rounded border border-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            min="0"
            step="any"
          />
        </div>
        <div onClick={handleTransfer} className="w-full">
          <Button>Send Transaction</Button>
          {transferRes &&
            <div className="text-green-400 mt-2 text-sm sm:text-base">
              {transferRes}
            </div>}
        </div>
      </div>

      <div className="mt-3 w-full max-w-md">
        <div onClick={handlecheckTransaction} className="w-full">
          <Button>Check Transaction</Button>
        </div>
        <div className="text-green-400 mt-2 text-sm sm:text-base break-words">
          {checktransaction}
        </div>
      </div>
    </div>
  );
};
