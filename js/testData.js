// This is testData for building and testing the application

const testData = [
  { 
    uniqueProjectID: "proj_7f9b3d21e0c4",
    projectTitle: "Test Project 1",
    projectDescription: `Some mumbo jumbo for my description.`,
    projectStatus: "In Progress",
    created: '2023-07-08T16:38:22Z',
    timeLog: [
      { date: '2023-07-16T17:38:22Z', time: 47 },
      { date: '2023-07-17T17:38:22Z', time: 23 },
    ],
    noteLog: [
      { date: '2023-07-16T17:38:22Z', note: 'Left off writing xyz...' },
      { date: '2023-07-17T17:38:22Z', note: 'Don\'t forget to turn off the lights.' },
    ],
    parentProjectID: null,
  },
  { 
    uniqueProjectID: "proj_mickey1234",
    projectTitle: "Mickey’s Magical Hat",
    projectDescription: `Helping Mickey find the magic to make his hat float and dance! And then some more garbage.`,
    projectStatus: "In Progress",
    created: '2025-09-01T09:00:00Z',
    timeLog: [
      { date: '2025-09-02T10:00:00Z', time: 42 },
      { date: '2025-09-03T15:00:00Z', time: 30 },
    ],
    noteLog: [
      { date: '2025-09-02T11:00:00Z', note: "Oops! The hat floated away again..." },
      { date: '2025-09-03T16:00:00Z', note: "Try adding some fairy dust next time!" },
    ],
    parentProjectID: null,
  },

  // Child projects for "Test Project 1"
  {
    uniqueProjectID: "proj_child1a",
    projectTitle: "Test 1 - Task A",
    projectDescription: "Write the intro to the test project.",
    projectStatus: "Complete",
    created: '2023-07-09T08:00:00Z',
    timeLog: [{ date: '2023-07-10T09:00:00Z', time: 15 }],
    noteLog: [{ date: '2023-07-10T09:15:00Z', note: "Intro written and reviewed." }],
    parentProjectID: "proj_7f9b3d21e0c4",
  },
  {
    uniqueProjectID: "proj_child1b",
    projectTitle: "Test 1 - Task B",
    projectDescription: "Add diagrams and charts.",
    projectStatus: "In Progress",
    created: '2023-07-11T10:00:00Z',
    timeLog: [{ date: '2023-07-12T14:00:00Z', time: 20 }],
    noteLog: [{ date: '2023-07-12T14:20:00Z', note: "Chart styles not finalized." }],
    parentProjectID: "proj_7f9b3d21e0c4",
  },

  // Additional child for Mickey’s project
  {
    uniqueProjectID: "proj_child2a",
    projectTitle: "Hat Levitation Spell",
    projectDescription: "Research ancient hat levitation techniques.",
    projectStatus: "Complete",
    created: '2025-09-02T10:00:00Z',
    timeLog: [{ date: '2025-09-02T12:00:00Z', time: 25 }],
    noteLog: [{ date: '2025-09-02T12:30:00Z', note: "Used spells from 'Ye Olde Magic Book'." }],
    parentProjectID: "proj_mickey1234",
  },
  {
    uniqueProjectID: "proj_child2b",
    projectTitle: "Mouse-Sized Stage Effects",
    projectDescription: "Miniature lighting and fog machine setup.",
    projectStatus: "In Progress",
    created: '2025-09-04T09:30:00Z',
    timeLog: [{ date: '2025-09-04T10:00:00Z', time: 35 }],
    noteLog: [{ date: '2025-09-04T11:00:00Z', note: "Lights too bright—scared Pluto." }],
    parentProjectID: "proj_mickey1234",
  },
  { 
    uniqueProjectID: "proj_bugs5678",
    projectTitle: "Bugs Bunny’s Carrot Contraption",
    projectDescription: `Inventing the ultimate carrot-powered rocket for a quick getaway!`,
    projectStatus: "Delayed (Elmer keeps chasing)",
    created: '2025-09-05T14:30:00Z',
    timeLog: [
      { date: '2025-09-06T10:00:00Z', time: 55 },
      { date: '2025-09-07T12:00:00Z', time: 20 },
    ],
    noteLog: [
      { date: '2025-09-06T11:30:00Z', note: "Added too many carrots—it's now a veggie overload!" },
      { date: '2025-09-07T13:00:00Z', note: "Need to hide from Elmer before testing again." },
    ],
    parentProjectID: "proj_mickey1234",
  },
];
