export const getAnonymousSessionId = (): string => {
  let sessionId = localStorage.getItem('anonymous_session_id');
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('anonymous_session_id', sessionId);
  }
  
  return sessionId;
};

export const clearAnonymousSession = (): void => {
  localStorage.removeItem('anonymous_session_id');
};