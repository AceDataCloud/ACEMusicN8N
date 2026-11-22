import type { INodeProperties } from "n8n-workflow";

const fields: INodeProperties[] = [
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
        name: "Lyric",
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
      {
        name: "Upload",
        value: "upload",
        description: "Import one reference track from a public HTTPS MP3 URL",
        action: "Upload audio",
      },
      {
        name: "Cover",
        value: "cover",
        description: "Create a cover using an owned platform audio ID",
        action: "Create an audio cover",
      },
      {
        name: "Mashup",
        value: "mashup",
        description:
          "Create a mashup using two compatible owned platform audio IDs",
        action: "Create an audio mashup",
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
        operation: ["create"],
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
        name: "ACE Music V1",
        value: "acemusic-v1",
      },
    ],
    displayOptions: {
      show: {
        resource: ["audio"],
        operation: ["create"],
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
        operation: ["create"],
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
    required: true,
    displayOptions: {
      show: {
        resource: ["audio"],
        operation: ["create"],
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
        operation: ["create"],
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
    displayName: "Audio URL",
    name: "audioUrl",
    type: "string",
    default: "",
    required: true,
    displayOptions: { show: { resource: ["audio"], operation: ["upload"] } },
    description:
      "Public HTTPS MP3 URL you own or may use. This import is separately priced and does not create a cover.",
  },
  {
    displayName: "Name",
    name: "uploadName",
    type: "string",
    default: "",
    displayOptions: { show: { resource: ["audio"], operation: ["upload"] } },
    description: "Optional display name for the imported reference",
  },
  {
    displayName: "Anchor Audio ID",
    name: "anchorAudioId",
    type: "string",
    default: "",
    displayOptions: { show: { resource: ["audio"], operation: ["upload"] } },
    description:
      "Optional successful caller-owned platform audio ID to anchor the import for reference use",
  },
  {
    displayName: "Audio ID",
    name: "audioId",
    type: "string",
    default: "",
    required: true,
    displayOptions: { show: { resource: ["audio"], operation: ["cover"] } },
    description: "A successful caller-owned platform audio ID, not its task ID",
  },
  {
    displayName: "Audio IDs",
    name: "mashupAudioIds",
    type: "string",
    default: "",
    required: true,
    displayOptions: { show: { resource: ["audio"], operation: ["mashup"] } },
    description:
      "Exactly two distinct compatible caller-owned platform audio IDs, separated by a comma",
  },
  {
    displayName: "Lyrics",
    name: "referenceLyric",
    type: "string",
    default: "",
    required: true,
    typeOptions: { rows: 4 },
    displayOptions: {
      show: { resource: ["audio"], operation: ["cover", "mashup"] },
    },
    description:
      "Lyrics for the new songs. Reference actions use ACE Music v1.1.",
  },
  {
    displayName: "Style",
    name: "referenceStyle",
    type: "string",
    default: "",
    required: true,
    displayOptions: {
      show: { resource: ["audio"], operation: ["cover", "mashup"] },
    },
    description: "Musical style for the new songs",
  },
  {
    displayName: "Title",
    name: "referenceTitle",
    type: "string",
    default: "",
    displayOptions: {
      show: { resource: ["audio"], operation: ["cover", "mashup"] },
    },
    description: "Optional title for the new songs",
  },
  {
    displayName: "Audio Influence",
    name: "audioInfluence",
    type: "number",
    default: 60,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: {
      show: { resource: ["audio"], operation: ["cover", "mashup"] },
    },
    description:
      "Reference influence from 1 to 100. Incompatible references are rejected without automatic upload or replacement.",
  },
  {
    displayName: "Simplify",
    name: "simplify",
    type: "boolean",
    default: true,
    description: "Whether to return a simplified response instead of raw data",
  },
];

const optionalNames = new Set([
  "model",
  "lyricsStyle",
  "uploadName",
  "anchorAudioId",
  "referenceTitle",
  "audioInfluence",
]);

export const properties: INodeProperties[] = [
  ...fields.map((field) =>
    optionalNames.has(field.name)
      ? {
          ...field,
          displayOptions: {
            show: { ...field.displayOptions?.show, "@version": [1] },
          },
        }
      : field,
  ),
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    displayOptions: {
      show: { "@version": [1.1], resource: ["audio", "lyrics"] },
    },
    options: fields
      .filter((field) => optionalNames.has(field.name))
      .map((field) => ({
        ...field,
        displayOptions: {
          show: Object.fromEntries(
            Object.entries(field.displayOptions?.show ?? {}).map(
              ([key, value]) => [`/${key}`, value],
            ),
          ),
        },
      }))
      .sort((left, right) => left.displayName.localeCompare(right.displayName)),
  },
];
