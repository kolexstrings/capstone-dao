import { useCallback, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";


interface AuthHooks {
  isAuthenticating: boolean;
  authClient: AuthClient | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
}
  

const useAuth = (): AuthHooks => {
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = useCallback(async () => {
    const alreadyAuthenticated = await authClient?.isAuthenticated()
    console.log("alreadyAuthenticated: ", alreadyAuthenticated);

    if (alreadyAuthenticated) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticating(true);

      authClient?.login({
        identityProvider: import.meta.env.VITE_DFX_NETWORK === "ic"
        ? "https://identity.ic0.app/#authorize"
        : "http://localhost:4943?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai",
        onSuccess: async () => {
          setIsAuthenticating(false);
          setIsAuthenticated(true);
        }
      })
    }

  },[authClient]);

  const logout = () => {
    setIsAuthenticated(false);
    authClient?.logout({ returnTo: "/" });
  };

  useEffect(() => {
    if (authClient == null) {
      setIsAuthenticating(true);

      AuthClient.create().then(async (client) => {
        await client?.isAuthenticated();
        setIsAuthenticating(false);
        setAuthClient(client);
      });
    }
  }, [authClient]);

  useEffect(() => {
    if (authClient && login != null) {
      (async () => {
        const authenticated = await authClient?.isAuthenticated();
        if (authenticated) {
          setIsAuthenticated(true);
        }
      })();
    }
  },);

  return {
    authClient,
    isAuthenticated,
    isAuthenticating,
    login,
    logout,
  };
};

export default useAuth;
