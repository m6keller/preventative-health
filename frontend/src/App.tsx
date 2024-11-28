import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, BrowserRouter} from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import CreateGame from './CreateGame';
import 'react-toastify/dist/ReactToastify.css';
import * as d3 from "d3";

import "./index.css"
import GameMasterPage from './GameMasterPage';
import { BASE_URL } from './consts';

interface ProfileSelectorProps {
  setPlayerId: Dispatch<SetStateAction<string | null>>;
  gameId: string;
  setGameId: Dispatch<SetStateAction<string>>;
}

function ProfileSelector({setPlayerId, gameId, setGameId}: ProfileSelectorProps) {
  
  const defaultImage = "https://upload.wikimedia.org/wikipedia/commons/9/9e/Ours_brun_parcanimalierpyrenees_1.jpg";
  const [profileImage, setProfileImage] = useState<string>(defaultImage);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // State to manage loading status

  
  const navigate = useNavigate();
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Start loading

    try {
      const response = await fetch(`${BASE_URL}/create-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: name, gameId }),
      });
  
      if (response.ok) {
        setLoading(false);
        setPlayerId(name);

        navigate('/gameplay');
      } else {
        console.error('Failed to create player');
      }
    } catch (error) {
      console.error('Error:', error);
    }

  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Profile Picture */}
      <div className="flex flex-col">
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200">
          <img
            src={profileImage}
            alt="Profile"
            className="object-cover w-full h-full rounded-full"
          />
        </div>
        <label className="flex cursor-pointer hover:bg-blue-600">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* Name Input */}
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-6 px-4 py-2 border rounded w-64 focus:outline-none focus:ring focus:border-blue-300"
      />
      {/* Name Input */}
      <input
        type="text"
        placeholder="Enter your game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        className="mt-6 px-4 py-2 border rounded w-64 focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading} 
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Loading...' : 'Submit'} {/* Show loading text while submitting */}
      </button>
      {loading && (
        <div className="mt-4">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-8 h-8"></div>
        </div>
      )}

      <button
        onClick={(() => {
          navigate("/createGame");
        })}
        className="mt-10 bg-grey-500 text-white px-6 py-2 rounded hover:bg-grey-800"
      >
        Ignore this one haha
      </button>
    </div>
  );
};

interface GameplayProps {
  gameId: string;
  playerId: string | null;
}

const ACTIVITIES = [
  { name: 'Gym', category: "Exercise"},
  // { name: 'Yoga', category: "Exercise"},
  // { name: "Hiking", category: "Exercise"},
  // { name: "Climbing", category: "Exercise"},
  { name: 'Checkup', category: "Checkup"},
  { name: "Cooking", category: "Nutrition"},
  // { name: "Farmer's Market", category: "Nutrition"},
  { name: "Sleep", category: "Rest"},
  // { name: "Meditation", category: "Rest"},
  // assume there are a lot more
] as const;

enum GameStage { 
  WAITING = "waiting",
  CHOOSING = "choosing",
  RESULTS = "results",
  END_RESULTS = "end_results"
}

interface ChooseResourcePoints {
  setGameStage: Dispatch<SetStateAction<GameStage>>;
  turnNumber: number;
  gameId: string;
  playerId: string | null;
  gameState: GameState | null;
  qualityOfLife: number;
  blockedActivities: Activity[];
}

interface GameState {
  id: string;
  turn: number;
  players: [];
  turnMax: number;
}


function ChooseResourcePoints({ setGameStage, turnNumber, qualityOfLife, playerId, gameState, blockedActivities }: ChooseResourcePoints) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!playerId) {
      navigate("/");
    }
  }, [playerId])

  const TARGET_RESOURCE_POINTS = 40;

  const [resourcePoints, setResourcePoints] = useState<Record<string, number>>({});

  const totalResourcePoints = Object.values(resourcePoints).reduce((acc, curr) => acc + curr, 0);

  const handleChange = (activityName: string, value: string) => {
    setResourcePoints((prev) => ({
      ...prev,
      [activityName]: parseInt(value, 10),
    }));
  };

  const handleSubmit = async () => {
    if (totalResourcePoints == TARGET_RESOURCE_POINTS) {
      try {

        const response = await fetch(`${BASE_URL}/assign-activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId: playerId, turn: turnNumber, resourcePoints, activitiesChosen: resourcePoints}),
        });

        console.log("RESPONSE", response);

        setGameStage(GameStage.WAITING);
      } catch {
        toast.error("Failed to submit resource points");
      }
      
    } else {

      const overflowResourcePoints = Math.abs(totalResourcePoints - TARGET_RESOURCE_POINTS);
      const errorMessage = totalResourcePoints > TARGET_RESOURCE_POINTS ? `You have assigned ${overflowResourcePoints} too many resource points` : `You need to assign ${overflowResourcePoints} more resource points`;
      toast.error(errorMessage)
    }
  }

  const resourcePointsLeftColour = totalResourcePoints > TARGET_RESOURCE_POINTS ? "bg-red-500" : totalResourcePoints < TARGET_RESOURCE_POINTS ? "bg-yellow-500": "bg-green-500"

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Choose How to Spend Your Resource Points</h1>
      <div className="text-l font-bold mb-6 text-center bg-blue-100 rounded-md"> Turn {turnNumber} {gameState?.turnMax && `of ${gameState.turnMax}`}</div>
      <QualityOfLifeBar value={qualityOfLife} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {ACTIVITIES.map((activity) => (
          <div
            key={activity.name}
            className={`${blockedActivities.includes(activity.name) ? "bg-red-100" : "bg-white"} shadow-md rounded-lg p-6 flex flex-col items-start hover:shadow-lg transition-shadow`}
          >
            <h2 className="text-lg font-semibold">{activity.name}</h2>
            <p className="text-gray-600 mb-4">{activity.category}</p>
            <select
              value={resourcePoints[activity.name] || ""}
              onChange={(e) => handleChange(activity.name, e.target.value)}
              className="px-3 py-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-300"
              disabled={blockedActivities.includes(activity.name)}
            >
              <option value="">Select resource points</option>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((resourcePoint) => (
                <option key={resourcePoint} value={resourcePoint}>
                  {resourcePoint} resource point{resourcePoint > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <HoursPieChart hours={resourcePoints} />
      </div>
      <div className="flex justify-center mt-8">
        <div className={`flex justify-center rounded-md p-4 text-white ${resourcePointsLeftColour}`}>
        {totalResourcePoints > TARGET_RESOURCE_POINTS ? `You have assigned ${totalResourcePoints - TARGET_RESOURCE_POINTS} too many resource points` : totalResourcePoints < TARGET_RESOURCE_POINTS ? `${TARGET_RESOURCE_POINTS - totalResourcePoints} resource points left to assign` : "All resource points assigned"}
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-8 py-2 rounded shadow hover:bg-blue-600"
        >
          Submit
        </button>
        <ToastContainer position="bottom-center" autoClose={1500} />
      </div>
    </div>
  );
}


interface HoursPieChartProps {
  // hours: { [key: string]: number };
  hours: Record<string, number>;
}

function HoursPieChart ({ hours }: HoursPieChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Prepare data
    const data = Object.entries(hours)
      .filter(([_, value]) => value > 0) // Only include activities with assigned hours
      .map(([name, value]) => ({ name, value }));

    // Chart dimensions
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Clear any existing content in the SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create color scale
    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(d3.schemeCategory10);

    // Create pie and arc generators
    const pie = d3.pie<{ name: string; value: number }>().value((d) => d.value);
    const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw pie chart
    svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      // @ts-ignore TODO!!!
      .attr("fill", (d) => color(d.data.name))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Add labels
    svg
      .selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#fff")
      .text((d) => d.data.name);
  }, [hours]);

  const totalHours = Object.values(hours).reduce((sum, num) => sum + num, 0);

  return totalHours > 0 ? <svg ref={svgRef}></svg> : <div>Please Dedicate Resource Points!</div>;
};

interface QualityOfLifeBarProps {
  value: number;
}

function QualityOfLifeBar ({ value }: QualityOfLifeBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value)); // Clamp value between 0 and 100
  const backgroundColour = normalizedValue > 66 ? "bg-green-500" : normalizedValue > 33 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className='flex flex-col m-4 bg-slate-100 rounded-md p-6 gap-2'>
      <div className="flex justify-center gap-2">
        <div className='font-bold'>Quality of Life: </div><div> {normalizedValue} / 100</div>
      </div>
      <div className="w-full bg-gray-200 rounded-lg h-4 overflow-hidden">
        <div
          className={`${backgroundColour} h-full transition-all duration-300`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
};

type Activity = typeof ACTIVITIES[number]['name'];

function Gameplay({gameId, playerId}: Readonly<GameplayProps>) {
  /*
  This part should be Waiting Room, Choose how to spend hours, or results

  */
  const [gameStage, setGameStage] = useState<GameStage>(GameStage.CHOOSING);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [turnNumber, setTurnNumber] = useState(0);
  const [qualityOfLife, setQualityOfLife] = useState(100);
  const [blockedActivities, setBlockedActivities] = useState<Activity[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (gameState?.turnMax && turnNumber >= gameState.turnMax) {
      setGameStage(GameStage.END_RESULTS);
    }
  }, [turnNumber])

  useEffect(() => {
    // will likely need to do something like this
    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-game?gameId=${gameId}`);

        if (response.ok) {
          const game = await response.json();
          console.log("GAME", game)
          if (game.turn != turnNumber) {
            setTurnNumber(game.turn);
          }
          setGameState(game);
        } else {
          console.error("Failed to fetch game state");
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    })();
  }, [turnNumber]);

  useEffect(() => {
    if (!playerId) {
      // Redirect to profile selector if no player ID
      navigate("/");
    }
  }, [playerId])

  return (
    <div>
      {gameStage == GameStage.CHOOSING && <ChooseResourcePoints 
        gameId={gameId}
        setGameStage={setGameStage} 
        turnNumber={turnNumber} 
        playerId={playerId}
        gameState={gameState}
        qualityOfLife={qualityOfLife}
        blockedActivities={blockedActivities}
      />}
      {gameStage == GameStage.WAITING && <WaitingRoom 
          setTurnNumber={setTurnNumber} 
          turnNumber={turnNumber}
          gameId={gameId}
          setGameStage={setGameStage}
          qualityOfLife={qualityOfLife}
        />}
      {gameStage == GameStage.RESULTS && <ResultsPage 
          gameId={gameId} 
          playerId={playerId} 
          turnNumber={turnNumber} 
          setGameStage={setGameStage}
          qualityOfLife={qualityOfLife}
          setQualityOfLife={setQualityOfLife}
          setBlockedActivities={setBlockedActivities}
        />}
      {gameStage == GameStage.END_RESULTS && <EndResultsPage 
          gameId={gameId} 
          playerId={playerId} 
          qualityOfLife={qualityOfLife}
        />}
      <h1 className='flex justify-center m-3'>Player: {playerId}</h1>
    </div>
  )
}

interface ResultsPageProps {
  gameId: string;
  playerId: string | null;
  turnNumber: number;
  setGameStage: Dispatch<SetStateAction<GameStage>>;
  qualityOfLife: number;
  setQualityOfLife: Dispatch<SetStateAction<number>>;
  setBlockedActivities: Dispatch<SetStateAction<Activity[]>>;
}

function ResultsPage({gameId, playerId, turnNumber, setGameStage, qualityOfLife, setQualityOfLife, setBlockedActivities} : ResultsPageProps) {
  const [results, setResults] = useState<[string, string][]>([]); // Array of [event, description] tuples

  useEffect(() => {
    // Function to fetch the results
    const fetchResults = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-bad-events?gameId=${gameId}&turn=${turnNumber}&playerId=${playerId}`);
        if (response.ok) {
          const data = await response.json();
          
          setBlockedActivities(data.blockedActivities);
          setQualityOfLife(data.qualityOfLife);
          setResults(data.events);
        } else {
          console.error('Failed to fetch results');
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    // Call fetchResults when component is mounted
    fetchResults();
  }, []);

  function handleSubmit() {
    setGameStage(GameStage.CHOOSING);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Turn {turnNumber} Events</h1>
      <QualityOfLifeBar value={qualityOfLife}/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {results.length ? results.map((eventInfo) => {
          console.log("event info", eventInfo);
          const [event, description] = eventInfo;
          return (
            <div className="text mb-6 text-center bg-blue-100 rounded-md p-6 gap-3">
              <h2 className="font-bold">{event}</h2>
              <p>{description}</p>
            </div>
          )
        }) : (
          <div className="mt-4">
            Results loading...
            <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-8 h-8"></div>
          </div>
        )}
        
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="mt-4  bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Next Turn
        </button>
      </div>
    </div>
  )
}

interface EndResultsPageProps {
  gameId: string;
  playerId: string | null;
  qualityOfLife: number;
}

function EndResultsPage({gameId, playerId, qualityOfLife} : EndResultsPageProps) {
  return (
    <div>
      <h1>End Results Page</h1>
      <div>Player {playerId}</div>
      <div>Game ID {gameId}</div>
      <QualityOfLifeBar value={qualityOfLife} />
    </div>
  )
}

interface WaitingRoomProps  {
  turnNumber: number;
  setTurnNumber: Dispatch<SetStateAction<number>>;
  gameId: string;
  setGameStage: Dispatch<SetStateAction<GameStage>>;
  qualityOfLife: number;
}


function WaitingRoom({ turnNumber, setTurnNumber, gameId, setGameStage, qualityOfLife } : WaitingRoomProps) {
  const waitingGifs = [
    "https://i.pinimg.com/originals/aa/57/46/aa574640b0f3e2c22a4798233212e35d.gif",
    "https://media.tenor.com/Y7ShQ_3hnn8AAAAM/me-waiting-for-my-friends-to-get-online.gif",
    "https://media.tenor.com/RD1C-k2gQZEAAAAM/waiting-cookiemonster.gif",
    "https://blakesnow.com/wp-content/uploads/sites/2/2015/06/funny-gifs-infinite-drink.gif",
  ]

  const navigator = useNavigate();

  useEffect(() => {
    // Function to fetch the turn data
    const fetchTurnData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-turn?gameId=${gameId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("DATA FROM GET TURN", data);
          console.log("turnNumber", turnNumber);
          console.log("data.turn >= turnNUmber + 1", data?.turn >= turnNumber + 1);
          if (data?.turn >= turnNumber + 1 ) {
            setTurnNumber(data?.turn);
            setGameStage(GameStage.RESULTS);
            navigator('/gameplay');
          }
        } else {
          console.error('Failed to fetch turn data');
        }
      } catch (error) {
        console.error('Error fetching turn data:', error);
      }
    };

    // Call fetchTurnData every second (1000ms)
    const intervalId = setInterval(fetchTurnData, 1000);

    // Clean up the interval when component is unmounted or when gameStage changes
    return () => clearInterval(intervalId);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center m-2">
      <h1 className="text-2xl font-bold mb-6 text-center">Waiting Room</h1>
      <div className="flex items-center m-auto">
        <img
          src={waitingGifs[Math.round(Math.random() * waitingGifs.length) || 0]}
          className="rounded-md"
          alt="waiting-gif"
        />
      </div>
      <QualityOfLifeBar value={qualityOfLife} />
    </div>
  )
}


function App() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string>("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelector 
            setPlayerId={setPlayerId}
            gameId={gameId}
            setGameId={setGameId}
          />} />
        <Route path="/gameplay" element={<Gameplay gameId={gameId} playerId={playerId}/>} />
        <Route path="/createGame" element={<CreateGame />} />
        <Route path="/gameMaster/:gameId" element={<GameMasterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;