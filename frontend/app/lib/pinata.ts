import { PinataSDK } from "pinata-web3";

export const pinataImageUrl = "https://gateway.pinata.cloud/ipfs"

export const pinata = new PinataSDK({
    pinataJwt: `${process.env.REACT_APP_PINATA_JWT}`,
    pinataGateway: `${process.env.REACT_APP_PUBLIC_PINATA_GATEWAY_URL}`
  })

export const pinFileToIPFS = async (file: File) => {
    try {
            const uploadData = await pinata.upload.file(file);
        if (!uploadData?.IpfsHash) {
            throw new Error("Failed to get IPFS hash from upload");
        }
        return `${pinataImageUrl}/${uploadData.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        throw error;
    }
};

export const pinJSONToIPFS = async (json: Record<string, any>) => {
    try {
        const uploadData = await pinata.upload.json(json);
        if (!uploadData?.IpfsHash) {
            throw new Error("Failed to get IPFS hash from upload");
        }
        return `${pinataImageUrl}/${uploadData.IpfsHash}`;
    } catch (error) {
        console.error("Error pinning JSON to IPFS:", error);
        throw error;
    }
};

export const unPinFromIPFS = async (hash: string) => {
    try {
        await pinata.unpin([hash]);
        return true;
    } catch (error) {
        console.error("Error unpinning file:", error);
        return false;
    }
};

