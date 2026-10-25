import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers, BrowserProvider } from "ethers";

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  isMetaMaskInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMetaMaskInstalled = typeof window !== "undefined" && !!(window as any).ethereum;

  useEffect(() => {
    if (isMetaMaskInstalled) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0].toLowerCase());
        } else {
          setAccount(null);
        }
      };

      const handleChainChanged = (hexChainId: string) => {
        setChainId(parseInt(hexChainId, 16));
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      // Check existing accounts
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0].toLowerCase());
          }
        })
        .catch(() => {});

      ethereum
        .request({ method: "eth_chainId" })
        .then((hexChainId: string) => {
          setChainId(parseInt(hexChainId, 16));
        })
        .catch(() => {});

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [isMetaMaskInstalled]);

  const connectWallet = async (): Promise<string | null> => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask is not installed. Please install MetaMask browser extension.");
      return null;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const selected = accounts[0].toLowerCase();
        setAccount(selected);
        const hexChainId = await ethereum.request({ method: "eth_chainId" });
        setChainId(parseInt(hexChainId, 16));
        return selected;
      }
      return null;
    } catch (err: any) {
      setError(err.message || "Failed to connect MetaMask");
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        isMetaMaskInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
