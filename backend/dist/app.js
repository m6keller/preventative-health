"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var cors_1 = __importDefault(require("cors"));
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
app.server = (0, http_1.createServer)(app);
// Allow requests from localhost:5173 (React dev server)
app.use((0, cors_1.default)({
    origin: '*', // or '*' to allow all origins
}));
var GAMES = new Map();
var MID_LEVEL_RESOURCES_ALLOCATED = 15;
var BadHealthEvents;
(function (BadHealthEvents) {
    BadHealthEvents["POOR_DIET"] = "Serious Physical Illness due to Poor Diet";
    BadHealthEvents["POOR_REST"] = "Burnt Out due to Lack of Rest";
    BadHealthEvents["POOR_EXERCISE"] = "Debilitating Physical Illness due to lack of Exercise";
    BadHealthEvents["POOR_CHECKUPS"] = "Serious Disease Diagnosis due to Lack of Regular Checkups";
})(BadHealthEvents || (BadHealthEvents = {}));
// Simulate in-memory player database
var playerDatabase = new Map();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.post("/create-player", function (req, res) {
    var body = req.body;
    var playerId = body.playerId, gameId = body.gameId;
    var turnMap = new Map();
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
        gameId: gameId,
        qualityOfLife: 100,
    });
    res.status(201).send('Player created');
});
app.post("/assign-activities", function (req, res) {
    var e_1, _a;
    var body = req.body;
    var playerId = body.playerId, turn = body.turn;
    var playerInfo = playerDatabase.get(playerId);
    if (!playerInfo) {
        res.status(404).send('Player not found');
        return;
    }
    var playerTurnsInfo = playerInfo.playerTurnsInfo;
    var activitiesChosen = body.activitiesChosen;
    var turnExercise = 0;
    var turnDiet = 0;
    var turnRest = 0;
    var turnCheckups = 0;
    console.log("Activities Chosen", activitiesChosen);
    try {
        for (var _b = __values(Object.entries(activitiesChosen)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), activity = _d[0], dedicatedResourcePoints = _d[1];
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
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log("SET PLAYER TURNS ".concat(turn, " TO "), {
        exercise: turnExercise,
        diet: turnDiet,
        rest: turnRest,
        checkups: turnCheckups,
    });
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
function getPlayerTotalTurnsScore(playerInfo) {
    var e_2, _a;
    var exerciseScore = 0;
    var dietScore = 0;
    var restScore = 0;
    var checkupsScore = 0;
    try {
        for (var _b = __values(Object.values(playerInfo)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var playerStats = _c.value;
            console.log("PLAYER STATS", playerStats);
            exerciseScore += playerStats.exercise;
            dietScore += playerStats.diet;
            restScore += playerStats.rest;
            checkupsScore += playerStats.checkups;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return {
        exerciseScore: exerciseScore,
        dietScore: dietScore,
        restScore: restScore,
        checkupsScore: checkupsScore,
    };
}
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function calculateBadHealthEvents(playerInfo, turn) {
    console.log("PLAYER INFO", playerInfo);
    var playerStats = getPlayerTotalTurnsScore(playerInfo);
    console.log("PLAYER STATS HOLISTIC", playerStats);
    var badHealthEvents = [];
    var RANDOM_THRESHOLD = 1 * turn + 1;
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
    if (playerStats.checkupsScore < MID_LEVEL_RESOURCES_ALLOCATED && randomBetween(1, 10) * (playerStats.checkupsScore / MID_LEVEL_RESOURCES_ALLOCATED) < RANDOM_THRESHOLD) {
        badHealthEvents.push(BadHealthEvents.POOR_CHECKUPS);
    }
    console.log("Bad Health Events", badHealthEvents);
    return badHealthEvents;
}
app.get("/get-players", function (req, res) {
    var e_3, _a;
    var gameId = req.query.gameId; // Extract gameId from query parameters
    var players = [];
    try {
        for (var playerDatabase_1 = __values(playerDatabase), playerDatabase_1_1 = playerDatabase_1.next(); !playerDatabase_1_1.done; playerDatabase_1_1 = playerDatabase_1.next()) {
            var _b = __read(playerDatabase_1_1.value, 2), playerId = _b[0], playerData = _b[1];
            if (playerData.gameId === gameId) {
                players.push({
                    id: playerId,
                    qualityOfLife: playerData.qualityOfLife,
                    playerTurnsInfo: Object.fromEntries(playerData.playerTurnsInfo),
                });
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (playerDatabase_1_1 && !playerDatabase_1_1.done && (_a = playerDatabase_1.return)) _a.call(playerDatabase_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    res.status(200).send({ players: players });
});
function generateRandomNormal(mean, stddev) {
    var u1 = Math.random();
    var u2 = Math.random();
    // Box-Muller Transformation
    var z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    // Scale to desired mean and standard deviation
    return z * stddev + mean;
}
var BadHealthEventsToConsequences = (_a = {},
    _a[BadHealthEvents.POOR_DIET] = "Sleep",
    _a[BadHealthEvents.POOR_REST] = "Gym",
    _a[BadHealthEvents.POOR_EXERCISE] = "Checkup",
    _a[BadHealthEvents.POOR_CHECKUPS] = "Cooking",
    _a);
var BadHealthEventsToDescriptions = (_b = {},
    _b[BadHealthEvents.POOR_DIET] = "You cannot rest due to Poor Diet",
    _b[BadHealthEvents.POOR_REST] = "You cannot go to the gym due to burnt out",
    _b[BadHealthEvents.POOR_EXERCISE] = "You cannot exercise due to a debilitating physical illness not caught in time",
    _b[BadHealthEvents.POOR_CHECKUPS] = "You cannot cook due to a serious disease diagnosis",
    _b);
function getRandomElements(arr, k) {
    if (arr.length < k)
        throw new Error("Array must have at least two elements");
    var shuffled = arr.sort(function () { return 0.5 - Math.random(); }); // Shuffle the array
    return shuffled.slice(0, k); // Take the first two elements
}
app.get("/get-bad-events", function (req, res) {
    var _a = req.query, turn = _a.turn, playerId = _a.playerId;
    var playerInfo = playerDatabase.get(playerId);
    if (!playerInfo) {
        res.status(404).send('Player not found');
        return;
    }
    var newBadHealthEvents = getRandomElements(calculateBadHealthEvents(playerInfo.playerTurnsInfo, Number(turn)), 2); // TODO: this honestly doesnt really work but whatever
    playerInfo.badHealthEvents = __spreadArray(__spreadArray([], __read(playerInfo.badHealthEvents), false), __read(newBadHealthEvents), false);
    var randomFactor = generateRandomNormal(0.6, 0.25);
    var qualityOfLifeReduction = Math.round(newBadHealthEvents.length * 10 * randomFactor);
    console.log("Quality of Life Reduction", qualityOfLifeReduction);
    console.log("randomFactor", randomFactor);
    playerInfo.qualityOfLife -= qualityOfLifeReduction;
    var badEventsWithDescription = newBadHealthEvents.map(function (event) {
        return [event, BadHealthEventsToDescriptions[event]]; // TODO: create a description for each event
    });
    var blockedActivities = newBadHealthEvents.map(function (event) {
        return BadHealthEventsToConsequences[event];
    });
    res.status(200).send({ events: badEventsWithDescription, qualityOfLife: playerInfo.qualityOfLife, blockedActivities: blockedActivities });
});
app.get("/get-game", function (req, res) {
    var gameId = req.query.gameId; // Extract gameId from query parameters
    var game = GAMES.get(gameId);
    if (!game) {
        res.status(404).send('Game not found');
        return;
    }
    res.status(200).send(game);
});
app.post("/advance-turn", function (req, res) {
    var gameId = req.body.gameId;
    var game = GAMES.get(gameId);
    if (!game) {
        res.status(404).send('Game not found');
        return;
    }
    game.turn++;
    res.status(200).send({ turn: game.turn });
});
app.post("/create-game", function (req, res) {
    var body = req.body;
    var turnMax = body.turnMax, gameId = body.gameId;
    if (!gameId) {
        res.status(400).send('Invalid request');
    }
    GAMES.set(gameId, {
        id: gameId,
        players: [],
        turn: 0,
        turnMax: turnMax,
    });
    res.status(201).send('Game created');
});
app.get("/get-turn", function (req, res) {
    var gameId = req.query.gameId; // Extract gameId from query parameters
    var game = GAMES.get(gameId);
    if (!game) {
        res.status(404).send('Game not found');
        return;
    }
    res.status(200).send({ turn: game.turn });
});
app.get('/hello-world', function (req, res) {
    res.send('Hello, World!');
});
// TODO:
// - List all games
// - Allow deleting of games
app.server = app.listen(port, function () {
    console.log("Server started on http://localhost:".concat(port));
});
