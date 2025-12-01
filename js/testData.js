// This is testData for building and testing the application

const testData = [
  { 
    uniqueProjectID: "proj_7f9b3d21e0c4",
    projectTitle: "Test Project 1",
    projectDescription: `Some mumbo jumbo for my description.`,
    projectStatus: "Complete",
    created: '2023-07-08T16:38:22Z',
    timeLog: [
      { uniqueEntryID: 'id_001', date: '2023-07-16T17:38:22Z', time: 47 },
      { uniqueEntryID: 'id_002', date: '2023-07-17T17:38:22Z', time: 23 },
    ],
    noteLog: [
      { uniqueEntryID: 'id_003', date: '2023-07-16T17:38:22Z', note: 'Left off writing xyz...' },
      { uniqueEntryID: 'id_004', date: '2023-07-17T17:38:22Z', note: "Don't forget to turn off the lights." },
    ],
    parentProjectID: null,
    placement: { dashboardOrder: 2 }
  },

  { 
    uniqueProjectID: "proj_mickey1234",
    projectTitle: "Mickey’s Magical Hat",
    projectDescription: `Helping Mickey find the magic to make his hat float and dance! And then some more garbage.`,
    projectStatus: "In Progress",
    created: '2025-09-01T09:00:00Z',
    timeLog: [
      { uniqueEntryID: 'id_005', date: '2025-09-02T10:00:00Z', time: 42 },
      { uniqueEntryID: 'id_006', date: '2025-09-03T15:00:00Z', time: 30 },
    ],
    noteLog: [
      { uniqueEntryID: 'id_007', date: '2025-09-02T11:00:00Z', note: "Oops! The hat floated away again..." },
      { uniqueEntryID: 'id_008', date: '2025-09-03T16:00:00Z', note: "Try adding some fairy dust next time!" },
    ],
    parentProjectID: null,
    placement: { dashboardOrder: 1 }
  },

  {
    uniqueProjectID: "proj_child1a",
    projectTitle: "Test 1 - Task A",
    projectDescription: "Write the intro to the test project.",
    projectStatus: "Complete",
    created: '2023-07-09T08:00:00Z',
    timeLog: [
      { uniqueEntryID: 'id_009', date: '2023-07-10T09:00:00Z', time: 15 }
    ],
    noteLog: [
      { uniqueEntryID: 'id_010', date: '2023-07-10T09:15:00Z', note: "Intro written and reviewed." }
    ],
    parentProjectID: "proj_7f9b3d21e0c4",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_child1b",
    projectTitle: "Test 1 - Task B",
    projectDescription: "Add diagrams and charts.",
    projectStatus: "In Progress",
    created: '2023-07-11T10:00:00Z',
    timeLog: [
      { uniqueEntryID: 'id_011', date: '2023-07-12T14:00:00Z', time: 20 }
    ],
    noteLog: [
      { uniqueEntryID: 'id_012', date: '2023-07-12T14:20:00Z', note: "Chart styles not finalized." }
    ],
    parentProjectID: "proj_7f9b3d21e0c4",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_child2a",
    projectTitle: "Hat Levitation Spell",
    projectDescription: "Research ancient hat levitation techniques.",
    projectStatus: "Complete",
    created: '2025-09-02T10:00:00Z',
    timeLog: [
      { uniqueEntryID: 'id_013', date: '2025-09-02T12:00:00Z', time: 25 }
    ],
    noteLog: [
      { uniqueEntryID: 'id_014', date: '2025-09-02T12:30:00Z', note: "Used spells from 'Ye Olde Magic Book'." }
    ],
    parentProjectID: "proj_mickey1234",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_child2b",
    projectTitle: "Mouse-Sized Stage Effects",
    projectDescription: "Miniature lighting and fog machine setup.",
    projectStatus: "Paused",
    created: '2025-09-04T09:30:00Z',
    timeLog: [
      { uniqueEntryID: 'id_015', date: '2025-09-04T10:00:00Z', time: 35 }
    ],
    noteLog: [
      { uniqueEntryID: 'id_016', date: '2025-09-04T11:00:00Z', note: "Lights too bright—scared Pluto." }
    ],
    parentProjectID: "proj_mickey1234",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_bugs5678",
    projectTitle: "Bugs Bunny’s Carrot Contraption",
    projectDescription: `Inventing the ultimate carrot-powered rocket for a quick getaway!`,
    projectStatus: "Delayed",
    created: '2025-09-05T14:30:00Z',
    timeLog: [
      { uniqueEntryID: 'id_017', date: '2025-09-06T10:00:00Z', time: 55 },
      { uniqueEntryID: 'id_018', date: '2025-09-07T12:00:00Z', time: 20 },
    ],
    noteLog: [
      { uniqueEntryID: 'id_019', date: '2025-09-06T11:30:00Z', note: "Added too many carrots—it's now a veggie overload!" },
      { uniqueEntryID: 'id_020', date: '2025-09-07T13:00:00Z', note: "Need to hide from Elmer before testing again." },
    ],
    parentProjectID: "proj_mickey1234",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_child2c",
    projectTitle: "Hat Sound Effects",
    projectDescription: "Design magical swoosh and sparkle sounds for hat animations.",
    projectStatus: "In Progress",
    created: '2025-09-05T08:00:00Z',
    timeLog: [
      { uniqueEntryID: 'id_021', date: '2025-09-05T09:00:00Z', time: 40 },
    ],
    noteLog: [
      { uniqueEntryID: 'id_022', date: '2025-09-05T09:45:00Z', note: "Too much sparkle—sounds like a firework show." },
    ],
    parentProjectID: "proj_mickey1234",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_child2d",
    projectTitle: "Hat Control Wand",
    projectDescription: "Craft a wand that remotely controls the hat’s movements.",
    projectStatus: "Complete",
    created: '2025-09-06T13:30:00Z',
    timeLog: [],
    noteLog: [
      { uniqueEntryID: 'id_023', date: '2025-09-06T13:45:00Z', note: "Idea: use enchanted wood from the Sorcerer’s Tree." },
    ],
    parentProjectID: "proj_mickey1234",
    placement: { dashboardOrder: null }
  },

  {
    uniqueProjectID: "proj_child2e",
    projectTitle: "Safety Testing Protocols",
    projectDescription: "Ensure the hat doesn’t accidentally fly off with Mickey.",
    projectStatus: "Dead",
    created: '2025-09-07T07:15:00Z',
    timeLog: [
      { uniqueEntryID: 'id_024', date: '2025-09-07T08:00:00Z', time: 50 },
    ],
    noteLog: [
      { uniqueEntryID: 'id_025', date: '2025-09-07T08:55:00Z', note: "Added straps. Still needs a magic failsafe." },
    ],
    parentProjectID: "proj_mickey1234",
    placement: { dashboardOrder: null }
  },
];
