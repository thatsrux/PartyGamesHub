import re

with open('src/pages/ClientJoin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace useLobby call
old_uselobby = """  const { lobby, joinLobby, leaveLobby, updateGameState, userId, setGameStatus } = useLobby(code || null);"""
new_uselobby = """  const { lobby, joinLobby, leaveLobby, updateGameState, userId, setGameStatus, isLoading: lobbyLoading } = useLobby(code || null);"""
content = content.replace(old_uselobby, new_uselobby)

# Replace useEffect for auto-rejoin
old_effect = """  // Auto-rejoin / Kick logic if page is refreshed
  useEffect(() => {
    if (userId) {
      if (lobby === null && isJoined) {"""

new_effect = """  // Auto-rejoin / Kick logic if page is refreshed
  useEffect(() => {
    if (userId && !lobbyLoading) {
      if (lobby === null && isJoined) {"""

content = content.replace(old_effect, new_effect)

# Replace another useEffect if any?
# There's another one:
old_effect2 = """        if (lobby.players && lobby.players[userId]) {
          // Player is successfully in the lobby
          if (!isJoined) {
            setIsJoined(true);
            sessionStorage.setItem('isJoined', 'true');
          }
          if (lobby.players[userId].name !== nickname) {
            setNickname(lobby.players[userId].name);
          }
        } else if (isJoined) {
          // Player thinks they are joined, but Firebase says they are NOT in the players list (e.g. kicked)
          setIsJoined(false);
          sessionStorage.setItem('isJoined', 'false');
          setError("Sei stato disconnesso o espulso dalla stanza.");
        }
      }
    }
  }, [isJoined, userId, lobby]);"""

new_effect2 = """        if (lobby.players && lobby.players[userId]) {
          // Player is successfully in the lobby
          if (!isJoined) {
            setIsJoined(true);
            sessionStorage.setItem('isJoined', 'true');
          }
          if (lobby.players[userId].name !== nickname) {
            setNickname(lobby.players[userId].name);
          }
        } else if (isJoined) {
          // Player thinks they are joined, but Firebase says they are NOT in the players list (e.g. kicked)
          setIsJoined(false);
          sessionStorage.setItem('isJoined', 'false');
          setError("Sei stato disconnesso o espulso dalla stanza.");
        }
      }
    }
  }, [isJoined, userId, lobby, lobbyLoading]);"""

content = content.replace(old_effect2, new_effect2)

# Now for the render part if lobby is loading
old_render = """    if (!lobby) {
      return <LoadingScreen message="Riconnessione alla stanza..." />;
    }"""

new_render = """    if (!lobby || lobbyLoading) {
      return <LoadingScreen message="Riconnessione alla stanza..." />;
    }"""

content = content.replace(old_render, new_render)

with open('src/pages/ClientJoin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ClientJoin.tsx")
