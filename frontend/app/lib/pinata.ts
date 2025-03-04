import { PinataSDK } from "pinata-web3";

export const pinataImageUrl = "https://gateway.pinata.cloud/ipfs"

export const pinata = new PinataSDK({
    pinataJwt: `${process.env.REACT_APP_PINATA_JWT}`,
    pinataGateway: `${process.env.REACT_APP_PUBLIC_PINATA_GATEWAY_URL}`
  })

export const pinFileToIPFS = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const response = await fetch("/api/pinata/pin/image", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        const url = `${pinataImageUrl}/${data.hash}`;
        return url; 
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        return null;
    }
};


export const pinJSONToIPFS = async (json: Record<string, any>) => {
    try {
        const response = await fetch("/api/pinata/pin/json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(json),
        });

        const data = await response.json();
        const url = `${pinataImageUrl}/${data.hash}`;
        return url;
    } catch (error) {
        console.error("Error pinning JSON to IPFS:", error);
        return null;
    }
};

export const unPinFromIPFS = async (hash: string) => {
    try {
        const response = await fetch(`/api/pinata/unpin/${hash}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            return true;
        } else {
            throw new Error("Unpin failed");
        }
    } catch (error) {
        console.error("Error unpinning file:", error);
        return false;
    }
};

