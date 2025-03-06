import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import LaunchpadAgentABI from "@/abi/LaunchpadAgent.json";
import { config } from "@/app/config/contract_addresses";

export const useLaunchpadAgentService = () => {
  const { data: walletClient } = useWalletClient();
  
  // Get contract address based on the current chain
  const getContractAddress = () => {
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const contractAddress = config[chainId as keyof typeof config]?.LaunchpadAgent?.address;
    if (!contractAddress) {
      throw new Error(`LaunchpadAgent contract address not found for chain ID ${chainId}`);
    }
    return contractAddress;
  };

  const registerTwitterHandle = async (twitterHandle: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    console.log("Registering Twitter handle:", twitterHandle);
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const contractAddress = getContractAddress();
    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      signer
    );
    const tx = await launchpadAgent.registerTwitterHandle(twitterHandle);
    const receipt = await tx.wait();
    return receipt;
  };

  const buyTokenCredits = async (amount: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    if (parseFloat(amount) <= 0) {
      throw new Error("Must send some ether");
    }
    console.log("Buying token credits with amount:", amount);
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const contractAddress = getContractAddress();
    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      signer
    );
    const tx = await launchpadAgent.buyTokenCredits({
      value: ethers.parseEther(amount),
    });
    const receipt = await tx.wait();
    return receipt;
  };

  const getUserTokenCredits = async (user: string) => {
    if (!walletClient) {
      console.warn("Wallet client not found, using read-only provider...");
      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
        );
        const contractAddress = getContractAddress();
        const launchpadAgent = new ethers.Contract(
          contractAddress,
          LaunchpadAgentABI,
          provider
        );
        const credits = await launchpadAgent.getUserTokenCredits(user);
        return credits;
      } catch (error) {
        console.error("Failed to use read-only provider:", error);
        return BigInt(0); // Return 0 credits if we can't fetch
      }
    }

    console.log("Getting token credits for user:", user);
    const provider = new ethers.BrowserProvider(walletClient);
    const contractAddress = getContractAddress();
    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      provider
    );
    const userTokenCredits = await launchpadAgent.getUserTokenCredits(user);
    return userTokenCredits;
  };

  const getTwitterHandleAddress = async (twitterHandle: string) => {
    if (!walletClient) {
        throw new Error("Wallet client not found");
      }
    console.log("Getting address for Twitter handle:", twitterHandle);

    const provider = new ethers.BrowserProvider(walletClient);
    const contractAddress = getContractAddress();
    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      provider
    );
    const address = await launchpadAgent.getTwitterHandleAddress(twitterHandle);
    return address;
  };

  const withdrawCredits = async (amount: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    const userTokenCredits = await getUserTokenCredits(
      walletClient.account.address
    );
    if (ethers.formatEther(userTokenCredits) < amount) {
      throw new Error("Insufficient token credits");
    }
    console.log("Withdrawing token credits with amount:", amount);
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const contractAddress = getContractAddress();
    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      signer
    );
    const tx = await launchpadAgent.withdrawCredits(ethers.parseEther(amount));
    const receipt = await tx.wait();
    return receipt;
  };

  return {
    registerTwitterHandle,
    buyTokenCredits,
    getUserTokenCredits,
    getTwitterHandleAddress,
    withdrawCredits,
  };
}; 