import { BrowserProvider, parseEther } from "ethers";

export const BSC_CHAIN_ID = "0x38"; // 56
export const MINT_FEE_BNB = "0.1";
// Placeholder receiving address (mint fee sink). Replace with deployed contract address.
export const MINT_RECEIVER = "0x65f4FA6A15EA8257dAaBa851f487919D2d5350fC";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("No wallet found. Install MetaMask.");
  const provider = new BrowserProvider(window.ethereum);
  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const chainId: string = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId !== BSC_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_CHAIN_ID }],
      });
    } catch (e: any) {
      if (e?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BSC_CHAIN_ID,
              chainName: "BNB Smart Chain",
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              rpcUrls: ["https://bsc-dataseed.binance.org/"],
              blockExplorerUrls: ["https://bscscan.com"],
            },
          ],
        });
      } else {
        throw e;
      }
    }
  }
  return { provider, address: accounts[0] };
}

export async function mintFlapCard(metadata: Record<string, unknown>) {
  if (!window.ethereum) throw new Error("No wallet");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  // Simulated mint: send mint fee to receiver with metadata in data field
  const tx = await signer.sendTransaction({
    to: MINT_RECEIVER,
    value: parseEther(MINT_FEE_BNB),
    data:
      "0x" +
      Array.from(new TextEncoder().encode(JSON.stringify(metadata).slice(0, 200)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
  });
  return tx;
}
