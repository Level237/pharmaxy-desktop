import { useState, useEffect } from 'react';

interface CurrentUser {
  name: string;
  role: string;
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const userJson = sessionStorage.getItem("currentUser");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
  }, []);

  return currentUser;
}
