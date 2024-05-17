import {createContext, useCallback, useState} from 'react';
import {Score} from '../types';

interface GameDataContextType {}

const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined,
);

function GameDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [personalScores, setPersonalScores] = useState<{
    content: Score[];
    totalElements: number;
  } | null>(null);

  const value = {};

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}
