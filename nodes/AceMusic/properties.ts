import type { INodeProperties } from "n8n-workflow";

export const properties: INodeProperties[] = [
  {
    displayName: "Resource",
    name: "resource",
    type: "options",
    default: "audio",
    noDataExpression: true,
    options: [
      {
        name: "Audio",
        value: "audio",
      },
      {
        name: 'Lyric',
        value: "lyrics",
      },
      {
        name: "Task",
        value: "task",
      },
    ],
  },
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    default: "create",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["audio"],
      },
    },
    options: [
      {
        name: "Create",
        value: "create",
        description: "Create audio through AceDataCloud",
        action: "Create audio",
      },
    ],
  },
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    default: "create",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["lyrics"],
      },
    },
    options: [
      {
        name: "Create",
        value: "create",
        description: "Create lyrics through AceDataCloud",
        action: "Create lyrics",
      },
    ],
  },
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    default: "get",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["task"],
      },
    },
    options: [
      {
        name: "Get",
        value: "get",
        description: "Retrieve an existing task",
        action: "Get a task",
      },
      {
        name: "Get Many",
        value: "getMany",
        description: "Retrieve existing tasks",
        action: "Get many tasks",
      },
    ],
  },
  {
    displayName: "Task ID",
    name: "taskId",
    type: "string",
    default: "",
    required: true,
    displayOptions: {
      show: {
        resource: ["task"],
        operation: ["get"],
      },
    },
    description: "The task ID returned by Create",
  },
  {
    displayName: "Task IDs",
    name: "taskIds",
    type: "string",
    default: "",
    required: true,
    displayOptions: {
      show: {
        resource: ["task"],
        operation: ["getMany"],
      },
    },
    description: "Comma-separated task IDs, up to 100",
  },
  {
    displayName: "Prompt",
    name: "prompt",
    type: "string",
    default: "",
    required: true,
    typeOptions: {
      rows: 4,
    },
    displayOptions: {
      show: {
        resource: ["audio", "lyrics"],
      },
    },
    description:
      "Describe your song or lyrics topic. In custom audio mode, enter the lyrics.",
  },
  {
    displayName: "Model",
    name: "model",
    type: "options",
    default: "acemusic-v1.1",
    options: [
      {
        name: "ACE Music v1.1",
        value: "acemusic-v1.1",
      },
      {
        name: 'ACE Music V1',
        value: "acemusic-v1",
      },
    ],
    displayOptions: {
      show: {
        resource: ["audio"],
      },
    },
    description: "The music model to use",
  },
  {
    displayName: "Custom Lyrics",
    name: "custom",
    type: "boolean",
    default: false,
    displayOptions: {
      show: {
        resource: ["audio"],
      },
    },
    description:
      "Whether to use Prompt as exact lyrics and supply a musical style",
  },
  {
    displayName: "Title",
    name: "title",
    type: "string",
    default: "",
    displayOptions: {
      show: {
        resource: ["audio"],
        custom: [true],
      },
    },
  },
  {
    displayName: "Style",
    name: "style",
    type: "string",
    default: "",
    required: true,
    displayOptions: {
      show: {
        resource: ["audio"],
        custom: [true],
      },
    },
    description: "Genre, mood, and instruments",
  },
  {
    displayName: "Lyrics Style",
    name: "lyricsStyle",
    type: "string",
    default: "",
    displayOptions: {
      show: {
        resource: ["lyrics"],
      },
    },
    description: "Optional musical style for the lyric draft",
  },
  {
    displayName: "Simplify",
    name: "simplify",
    type: "boolean",
    default: true,
    description: "Whether to return a simplified response instead of raw data",
  },
];
