import express, { Request, Response, Application } from 'express';
import { createServer, Server } from 'http';
import cors from 'cors';

// Extend the Express app interface (This seems super hacky but whatever)
interface CustomExpressApp extends Application {
  server?: Server;
}

const app: CustomExpressApp = express();
const port = process.env.PORT || 3000;
app.server = createServer(app);

// Allow requests from localhost:5173 (React dev server)
app.use(cors({
  origin: '*', // or '*' to allow all origins
}));

interface Game {
  id: string;
  players: string[];
  turn: number;
  turnMax: number;
}

const GAMES = new Map<string, Game>();

const MID_LEVEL_RESOURCES_ALLOCATED = 15;

interface PlayerTurnDatabaseModel { 
  exercise: number; 
  diet: number; 
  rest: number; 
  checkups: number; 
}


enum BadHealthEvents {
  POOR_DIET = "Serious Physical Illness due to Poor Diet", // Can't rest
  POOR_REST = "Burnt Out due to Lack of Rest", // Cant Exercise
  POOR_EXERCISE = "Debilitating Physical Illness due to lack of Exercise", // Can't get to checkups
  POOR_CHECKUPS = "Serious Disease Diagnosis due to Lack of Regular Checkups", // Hard to eat properly
}

interface PlayerDatabaseModel {
  playerTurnsInfo: Map<number, PlayerTurnDatabaseModel>;
  badHealthEvents: BadHealthEvents[];
  gameId: string;
  qualityOfLife: number;
}

// Simulate in-memory player database
const playerDatabase = new Map<string, PlayerDatabaseModel>();

// Middleware to parse JSON bodies
app.use(express.json());


app.post("/create-player", (req: Request, res: Response) => {
  const body = req.body;
  const { playerId, gameId } = body;
  const turnMap = new Map<number, PlayerTurnDatabaseModel>()

  if (!playerId || !gameId) {
    res.status(400).send('Invalid request');
  }

  if (!GAMES.has(gameId)) {
    res.status(404).send('Game not found');
    return;
  }

  turnMap.set(1, {
    exercise: 0,
    diet: 0,
    rest: 0,
    checkups: 0,
  });

  playerDatabase.set(playerId, {
    playerTurnsInfo: turnMap,
    badHealthEvents: [],
    gameId,
    qualityOfLife: 100,
  });

  res.status(201).send('Player created');
});

app.post("/assign-activities", (req: Request, res: Response) => {
  const { body } = req;
  const { playerId, turn } = body;
  const playerInfo = playerDatabase.get(playerId);

  if (!playerInfo) {
    res.status(404).send('Player not found');
    return;
  }

  const { playerTurnsInfo } = playerInfo;

  const activitiesChosen: Record<string, number> = body.activitiesChosen;
  let turnExercise = 0;
  let turnDiet = 0;
  let turnRest = 0;
  let turnCheckups = 0;
  
  console.log("Activities Chosen", activitiesChosen);

  for (const [activity, dedicatedResourcePoints] of Object.entries(activitiesChosen)) {
    // update newTurnInfo
    switch (activity) {
      case "Gym":
        turnExercise += dedicatedResourcePoints;
        break;
      case "Cooking":
        turnDiet += dedicatedResourcePoints;
        break;
      case "Sleep":
        turnRest += dedicatedResourcePoints;
        break;
      case "Checkup":
        turnCheckups += dedicatedResourcePoints;
        break;
      default:
        console.error("Invalid activity type");
        res.status(400).send('Invalid activity type');
        return;
    }
  }

  console.log(`SET PLAYER TURNS ${turn} TO `,  {
    exercise: turnExercise,
    diet: turnDiet,
    rest: turnRest,
    checkups: turnCheckups,
  })

  playerTurnsInfo.set(turn, {
    exercise: turnExercise,
    diet: turnDiet,
    rest: turnRest,
    checkups: turnCheckups,
  });

  res.status(200).send({
    exercise: turnExercise,
    diet: turnDiet,
    rest: turnRest,
    checkups: turnCheckups,
  });
});

function getPlayerTotalTurnsScore (playerInfo: Map<number, PlayerTurnDatabaseModel>) {
  let exerciseScore = 0;
  let dietScore = 0;
  let restScore = 0;
  let checkupsScore = 0;

  for (const playerStats of Object.values(playerInfo)) {
    console.log("PLAYER STATS", playerStats);
    exerciseScore += playerStats.exercise;
    dietScore += playerStats.diet;
    restScore += playerStats.rest;
    checkupsScore += playerStats.checkups;
  }

  return {
    exerciseScore,
    dietScore,
    restScore,
    checkupsScore,
  }
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function calculateBadHealthEvents(playerInfo: Map<number, PlayerTurnDatabaseModel>, turn: number) {
  console.log("PLAYER INFO", playerInfo);
  const playerStats = getPlayerTotalTurnsScore(playerInfo);
  console.log("PLAYER STATS HOLISTIC", playerStats);

  const badHealthEvents: BadHealthEvents[] = [];

  const RANDOM_THRESHOLD = 1 * turn + 1;

  console.log("RANDOM STUFF");
  console.log("RANDOM BETWEENS");
  console.log(randomBetween(1, 10));
  console.log(randomBetween(1, 10));
  console.log(randomBetween(1, 10));
  console.log(randomBetween(1, 10));
  console.log(randomBetween(1, 10));

  if (playerStats.exerciseScore < MID_LEVEL_RESOURCES_ALLOCATED && randomBetween(1, 10) * (playerStats.exerciseScore / MID_LEVEL_RESOURCES_ALLOCATED) < RANDOM_THRESHOLD) {
    badHealthEvents.push(BadHealthEvents.POOR_EXERCISE);
  }

  if (playerStats.dietScore < MID_LEVEL_RESOURCES_ALLOCATED && randomBetween(1, 10) * (playerStats.dietScore / MID_LEVEL_RESOURCES_ALLOCATED) < RANDOM_THRESHOLD) {
    badHealthEvents.push(BadHealthEvents.POOR_DIET);
  }

  if (playerStats.restScore < MID_LEVEL_RESOURCES_ALLOCATED && randomBetween(1, 10) * (playerStats.restScore / MID_LEVEL_RESOURCES_ALLOCATED) < RANDOM_THRESHOLD) {
    badHealthEvents.push(BadHealthEvents.POOR_REST);
  }

  if (playerStats.checkupsScore < MID_LEVEL_RESOURCES_ALLOCATED &&randomBetween(1, 10) * (playerStats.checkupsScore / MID_LEVEL_RESOURCES_ALLOCATED) < RANDOM_THRESHOLD) {
    badHealthEvents.push(BadHealthEvents.POOR_CHECKUPS);
  }

  console.log("Bad Health Events", badHealthEvents);

  return badHealthEvents;
}

app.get("/get-players", (req: Request, res: Response) => {
  const gameId = req.query.gameId as string; // Extract gameId from query parameters

  const players = []

  for (const [playerId, playerData] of playerDatabase) {
    if (playerData.gameId === gameId) {
      players.push({
        id: playerId,
        qualityOfLife: playerData.qualityOfLife,
        playerTurnsInfo: Object.fromEntries(playerData.playerTurnsInfo),
      });
    }
  }

  res.status(200).send({ players });
});


function generateRandomNormal(mean: number, stddev: number) {
  let u1 = Math.random();
  let u2 = Math.random();

  // Box-Muller Transformation
  let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  // Scale to desired mean and standard deviation
  return z * stddev + mean;
}

const BadHealthEventsToConsequences: Record<BadHealthEvents, string> = {
  [BadHealthEvents.POOR_DIET]: "Sleep",
  [BadHealthEvents.POOR_REST]: "Gym",
  [BadHealthEvents.POOR_EXERCISE]: "Checkup",
  [BadHealthEvents.POOR_CHECKUPS]: "Cooking",
}


const BadHealthEventsToDescriptions: Record<BadHealthEvents, string> = {
  [BadHealthEvents.POOR_DIET]: "You cannot rest due to Poor Diet",
  [BadHealthEvents.POOR_REST]: "You cannot go to the gym due to burnt out",
  [BadHealthEvents.POOR_EXERCISE]: "You cannot exercise due to a debilitating physical illness not caught in time",
  [BadHealthEvents.POOR_CHECKUPS]: "You cannot cook due to a serious disease diagnosis",
}

function getRandomElements<T>(arr: T[], k: number) {
  if (arr.length < k) throw new Error("Array must have at least two elements");
  const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle the array
  return shuffled.slice(0, k); // Take the first two elements
}


app.get("/get-bad-events", (req: Request, res: Response) => {
  const { turn, playerId } = req.query


  const playerInfo = playerDatabase.get(playerId as string);

  if (!playerInfo) {
    res.status(404).send('Player not found');
    return;
  }

  const newBadHealthEvents = getRandomElements(calculateBadHealthEvents(playerInfo.playerTurnsInfo, Number(turn)), 2); // TODO: this honestly doesnt really work but whatever

  playerInfo.badHealthEvents = [...playerInfo.badHealthEvents, ...newBadHealthEvents];

  const randomFactor =  generateRandomNormal(0.6, 0.25)
  const qualityOfLifeReduction = Math.round(newBadHealthEvents.length * 10 * randomFactor);
  
  console.log("Quality of Life Reduction", qualityOfLifeReduction);
  console.log("randomFactor", randomFactor);

  playerInfo.qualityOfLife -= qualityOfLifeReduction

  const badEventsWithDescription = newBadHealthEvents.map((event) => {
    return [event, BadHealthEventsToDescriptions[event]] // TODO: create a description for each event
  });

  const blockedActivities = newBadHealthEvents.map((event) => {
    return BadHealthEventsToConsequences[event];
  });

  res.status(200).send({ events: badEventsWithDescription, qualityOfLife: playerInfo.qualityOfLife, blockedActivities });
});

app.get("/get-game", (req: Request, res: Response) => {
  const gameId = req.query.gameId as string; // Extract gameId from query parameters

  const game = GAMES.get(gameId);
  if (!game) {
    res.status(404).send('Game not found');
    return;
  }

  res.status(200).send(game);

});

app.post("/advance-turn", (req: Request, res: Response) => {
  const gameId = req.body.gameId;

  const game = GAMES.get(gameId);
  if (!game) {
    res.status(404).send('Game not found');
    return;
  }

  game.turn++;

  res.status(200).send({ turn: game.turn });
});

app.post("/create-game", (req: Request, res: Response) => {
  const body = req.body

  const { turnMax, gameId } = body
  
  if (!gameId) {
    res.status(400).send('Invalid request');
  }

  GAMES.set(gameId, {
    id: gameId,
    players: [],
    turn: 0,
    turnMax,
  });

  res.status(201).send('Game created');
});

app.get("/get-turn", (req: Request, res: Response) => {
  const gameId = req.query.gameId as string; // Extract gameId from query parameters

  const game = GAMES.get(gameId);
  if (!game) {
    res.status(404).send('Game not found');
    return;
  }

  res.status(200).send({ turn: game.turn });
});

app.get('/hello-world', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// TODO:
// - List all games
// - Allow deleting of games

app.server = app.listen(port, () => {

  console.log(`Server started on http://localhost:${port}`);
});