import re

with open('src/hooks/useLobby.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add isLoading state
old_state = """  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);"""

new_state = """  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);"""

content = content.replace(old_state, new_state)

# Set isLoading to false when onValue triggers
old_onvalue = """    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLobby(data);
      } else {
        setLobby(null);
      }
    });"""

new_onvalue = """    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLobby(data);
      } else {
        setLobby(null);
      }
      setIsLoading(false);
    });"""

content = content.replace(old_onvalue, new_onvalue)

# Return isLoading
old_return = """  return {
    lobby,
    userId,
    error,
    joinLobby,"""

new_return = """  return {
    lobby,
    userId,
    error,
    isLoading,
    joinLobby,"""

content = content.replace(old_return, new_return)

with open('src/hooks/useLobby.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated useLobby.ts")
