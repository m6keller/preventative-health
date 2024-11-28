// /*
// App to model decay overtime of a person's health based on prevenative measures
// - each term (10 years you choose youar activiites and behaviours and see how muchy it costs the system at the end)
// */
// // Each term you allocate HOURS to do stuff and fun time and what not
// // Add in obstacles that disallow people from signing up for stuff each turn
// // Least burden on healthcare system is how ou win(Least dollars cost to healthcare system)
// // Exercise
// // Diet
// // Regular Sleep
// // Checkups
// // Socializing
// // 
// // We need players and stuff
// // Health into:
// // - Exercise
// // - Diet
// // - Regular Sleep
// // - Checkups - renamed to something like
// // - Mental Health
// // Define Activities
// // Define Events
// // // Pretent this is somethign that the government can allieviate
// // You can't pay for your gym pass
// // Dental Insurance Epxired
// // Medication Insurance Expired
// // Can't pay for mental health services
// // Effecitve events should just have a category and whether or not its blocked
// // TODO: Add more
// type EventName = "GymPass" | "DentalInsurance" | "MedicationInsurance" | "MentalHealthServices";
// const EventNameToCategory: Record<EventName, "Exercise" | "Checkups" | "MentalHealth"> = {
//     GymPass: "Exercise",
//     DentalInsurance: "Checkups",
//     MedicationInsurance: "Checkups",
//     MentalHealthServices: "MentalHealth"
// }
// // Can be played all in memory or with websockets or something...
// // BadHealthEvents: Serious Physical Illness, Serious Mental Illness, Death
// const BadHealthEventsToCategory: Record<BadHealthEvents, "PhysicalIllness" | "MentalIllness" | "Death"> = {
//     SeriousPhysicalIllness: "PhysicalIllness",
//     SeriousMentalIllness: "MentalIllness",
//     Death: "Death"
// }
// // Maybe just 
// function calculateBadHealthEvents(playerStats: { exercise: number; diet: number; regularSleep: number; checkups: number; socializing: number; }): BadHealthEvents[] {
//     // Calculate bad things that happen
//     const badHealthEvents: BadHealthEvents[] = [];
//     if (playerStats.exercise < 0) {
//         badHealthEvents.push("SeriousPhysicalIllness");
//     }
//     if (playerStats.diet < 0) {
//         badHealthEvents.push("SeriousPhysicalIllness");
//     }
//     if (playerStats.regularSleep < 0) {
//         badHealthEvents.push("SeriousPhysicalIllness");
//     }
//     if (playerStats.checkups < 0) {
//         badHealthEvents.push("SeriousPhysicalIllness");
//     }
//     if (playerStats.socializing < 0) {
//         badHealthEvents.push("SeriousMentalIllness");
//     }
//     return badHealthEvents;
// }
// export function chooseActivities(personId: string, activitiesChosen: [Activity, number][]) {
//     // Choose activities
//     // Person = fetch person from db
//     // Choose activities
//     const playerStats = { // Actually just update from database
//         exercise: 0,
//         diet: 0,
//         rest: 0,
//         checkups: 0,
//         socializing: 0
//     };
//     for (const [activity, hours] of activitiesChosen) {
//         // Write this more shorthand
//         playerStats.exercise += activity.exerciseScore * hours;
//         playerStats.diet += activity.dietScore * hours;
//         playerStats.rest += activity.restScore * hours;
//         playerStats.checkups += activity.checkupsScore * hours;
//         playerStats.socializing += activity.mentalHealthScore * hours;
//     }
//     // Save players to DB
//     // Calculate bad things that happen
//     const newBadHealthEvents = calculateBadHealthEvents(playerStats);
//     // Calculate costs to healthcare system
//     const costToHealthcareSystem = newBadHealthEvents.length * 1000; // Just a placeholder
//     // Save costs to DB
//     return newBadHealthEvents;
//     // Add events 
// }
// export async function narrorateBadHealthEvents(name: string, events: BadHealthEvents[]) {
//     const eventDescriptions = {
//         SeriousPhysicalIllness: "faced a serious physical illness.",
//         SeriousMentalIllness: "experienced a significant mental health challenge.",
//         Death: "suffered an untimely death.",
//     };
//     if (events.length === 0) {
//         return `${name} has not experienced any notable bad health events.`;
//     }
//     const eventList = events.map(event => eventDescriptions[event]).join(' ');
//     const prompt = `
// Write a ~100-word narrative summarizing the following bad health events for ${name}:
// ${eventList}
// Use empathetic and respectful language, while being concise.`;
//     try {
//         // const response = await openai.chat.completions.create({
//         //     model: "gpt-4",
//         //     messages: [{ role: "system", content: "You are a helpful assistant." },
//         //                { role: "user", content: prompt }],
//         //     max_tokens: 100,
//         //     temperature: 0.7,
//         // });
//         // if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
//         //     throw Error("An error occurred while generating the narrative.");
//         // }
//         // return response.choices[0].message.content.trim();
//         return "ailskjdlkjs"
//     } catch (error) {
//         console.error("Error generating narrative:", error);
//         return "An error occurred while generating the narrative.";
//     }
// }
// export async function startTurn(turn: number): Promise<{ event: BadHealthEvents; description: string } | null> {
//     // Mapping events based on turn severity
//     const events: BadHealthEvents[] = ["SeriousPhysicalIllness", "SeriousMentalIllness", "Death"];
//     const event = events[Math.min(turn - 1, events.length - 1)];
//     // Prompt for generating a comical description
//     const prompt = `
// Generate a funny and lighthearted description of a bad health event of type "${event}" for turn ${turn}. 
// Keep it witty and absurd while acknowledging the event in a humorous tone.`;
//     try {
//         // const response = await openai.chat.completions.create({
//         //     model: "gpt-4",
//         //     messages: [{ role: "system", content: "You are a humorous assistant who writes comical narratives." },
//         //                { role: "user", content: prompt }],
//         //     max_tokens: 100,
//         //     temperature: 0.8, // Adds more creativity
//         // });
//         // const description = response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content ? response.choices[0].message.content.trim() : "An error occurred while generating the description.";
//         const description = "alksjdklfjlka"
//         return { event, description };
//     } catch (error) {
//         console.error("Error generating event description:", error);
//         return null; // Fallback in case of errors
//     }
// }
