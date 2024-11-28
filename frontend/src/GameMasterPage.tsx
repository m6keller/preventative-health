// src/components/GamePage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface GameState {
  id: string;
  turn: number;
  players: [];
  turnMax: number;
}

interface Player {
    id: string;
    qualityOfLife: number;
    playerTurnsInfo: Record<number, PlayerTurnInfo>; 
}

interface PlayerTurnInfo {
    checkups: number;
    diet: number;
    exercise: number;
    rest: number;
}

const BASE_URL = "https://preventative-health-mlm8.vercel.app"; // "http://localhost:3000";


function GameMasterPage () {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`${BASE_URL}/get-players?gameId=${gameId}`);

                if (response.ok) {
                    const { players } = await response.json();

                    setPlayers(players);
                } else {
                    console.error("Failed to fetch players");
                }
            } catch (error) {
            console.error("Error fetching players:", error);
            }
        })()
    }, [gameState]);

    const fetchGameState = async () => {
        try {
            const response = await fetch(`${BASE_URL}/get-game?gameId=${gameId}`);

            if (response.ok) {
                const game = await response.json();

                setGameState(game);
            } else {
                console.error("Failed to fetch game state");
            }
        } catch (error) {
        console.error("Error fetching game state:", error);
        }
    };

    const advanceTurn = async () => {
        try {
            const response = await fetch(`${BASE_URL}/advance-turn`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ gameId }),
            });

            if (response.ok) {
                fetchGameState(); // Fetch the updated game state after advancing the turn
            } else {
                console.error("Failed to advance the turn");
        }
        } catch (error) {
            console.error("Error advancing the turn:", error);
        }
    };

    useEffect(() => {
        fetchGameState(); // Fetch the initial game state when the page loads
    }, [gameId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Game Page: {gameId}</h1>

        {gameState ? (
            <div className="w-96 p-6 bg-white rounded-lg shadow-md">
                <div className="mb-4">
                    <h2 className="text-lg font-medium">Current Turn: {gameState.turn}</h2>
                    <p>Max Turns: {gameState.turnMax}</p>
                </div>

                <button
                    onClick={advanceTurn}
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Advance Turn
                </button>
                
            </div>
        ) : (
            <p>Loading game state...</p>
        )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
                {players.map((player) => {
                    return (
                        <div className="mb-4 bg-white rounded-md p-5">
                            <h2 className="text-lg font-medium">Player ID: {player.id}</h2>
                            <p>Quality of Life: {player.qualityOfLife}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default GameMasterPage;
