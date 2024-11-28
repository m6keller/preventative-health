import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateGame() {
  const [gameId, setGameId] = useState<string>("");
  const [turnMax, setTurnMax] = useState<number>(4);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/create-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId, turnMax }),
      });

      if (response.ok) {
        // navigate("/game", { state: { gameId } });
        navigate(`/gameMaster/${gameId}`);
      } else {
        alert("Failed to create the game");
      }
    } catch (error) {
      console.error("Error creating the game:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Create a New Game</h1>

      <div className="w-96 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">Game ID</label>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter Game ID"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">Max Turns</label>
          <input
            type="number"
            value={turnMax}
            onChange={(e) => setTurnMax(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter max turns"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Game
        </button>
      </div>
    </div>
  );
};

export default CreateGame;
