const { test } = require("node:test");
const assert = require("node:assert/strict");
const { AceMusic } = require("../dist/nodes/AceMusic/AceMusic.node.js");
const { taskResult } = require("../dist/nodes/AceMusic/helpers.js");
const {
  AceDataAceMusicApi,
} = require("../dist/credentials/AceDataAceMusicApi.credentials.js");
function context(parameters, response) {
  const calls = [];
  const ctx = {
    getInputData: () => [{ json: {} }],
    getNodeParameter: (key, index, fallback) => parameters[key] ?? fallback,
    getNode: () => ({
      name: "ACE Music",
      type: "aceMusic",
      typeVersion: 1,
      position: [0, 0],
    }),
    continueOnFail: () => false,
    helpers: {
      httpRequestWithAuthentication: async function (credential, request) {
        calls.push({ credential, ...request });
        return response;
      },
      returnJsonArray: (data) => data.map((json) => ({ json })),
      constructExecutionMetaData: (data) => data,
    },
  };
  return { ctx, calls };
}
test("idea creation sends exactly one supported async request", async () => {
  const { ctx, calls } = context(
    {
      resource: "audio",
      operation: "create",
      prompt: "Warm folk song",
      model: "acemusic-v1.1",
      custom: false,
    },
    { task_id: "task-1" },
  );
  const result = await new AceMusic().execute.call(ctx);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.acedata.cloud/acemusic/audios");
  assert.deepEqual(calls[0].body, {
    action: "generate",
    model: "acemusic-v1.1",
    async: true,
    custom: false,
    prompt: "Warm folk song",
  });
  assert.equal(result[0][0].json.taskId, "task-1");
  assert.equal(result[0][0].json.finished, false);
});
test("custom creation maps Prompt to lyric with title and style", async () => {
  const { ctx, calls } = context(
    {
      resource: "audio",
      operation: "create",
      prompt: "[Verse] Home",
      model: "acemusic-v1",
      custom: true,
      title: "Home",
      style: "Folk",
    },
    { task_id: "task-2" },
  );
  await new AceMusic().execute.call(ctx);
  assert.equal(calls[0].body.lyric, "[Verse] Home");
  assert.equal(calls[0].body.prompt, undefined);
  assert.equal(calls[0].body.title, "Home");
});
test("lyrics use the independent supported request contract", async () => {
  const { ctx, calls } = context(
    {
      resource: "lyrics",
      operation: "create",
      prompt: "Home",
      lyricsStyle: "Folk",
    },
    {
      success: true,
      task_id: "lyric-1",
      data: [{ title: "Home", text: "words" }],
    },
  );
  const result = await new AceMusic().execute.call(ctx);
  assert.deepEqual(calls[0].body, { prompt: "Home", style: "Folk" });
  assert.equal(result[0][0].json.data[0].text, "words");
});
test("retrieval queries the original identity without creation", async () => {
  const { ctx, calls } = context(
    { resource: "task", operation: "get", taskId: "task-1" },
    {
      id: "task-1",
      state: "partial_failed",
      response: {
        success: false,
        data: [{ audio_url: "https://cdn.acedata.cloud/a.mp3" }],
      },
    },
  );
  const result = await new AceMusic().execute.call(ctx);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.acedata.cloud/acemusic/tasks");
  assert.equal(result[0][0].json.finished, true);
  assert.equal(result[0][0].json.successful, false);
  assert.equal(result[0][0].json.data.length, 1);
});
test("batch retrieval validates the bound before issuing a request", async () => {
  const { ctx, calls } = context(
    {
      resource: "task",
      operation: "getMany",
      taskIds: Array.from({ length: 101 }, (_, i) => "id-" + i).join(","),
    },
    {},
  );
  await assert.rejects(new AceMusic().execute.call(ctx));
  assert.equal(calls.length, 0);
});
test("processing never counts as completed and credential test is free", () => {
  assert.equal(taskResult({ id: "one", state: "processing" }).finished, false);
  const credential = new AceDataAceMusicApi();
  assert.equal(credential.test.request.url, "/acemusic/tasks");
  assert.deepEqual(credential.test.request.body, {
    action: "list",
    limit: 1,
    offset: 0,
  });
  assert.equal(new AceMusic().description.name, "aceMusic");
});

test("lyrics acceptance without data remains pending and omits empty optional style", async () => {
  const { ctx, calls } = context(
    { resource: "lyrics", operation: "create", prompt: "Home" },
    { task_id: "lyrics-pending" },
  );
  const result = await new AceMusic().execute.call(ctx);
  assert.deepEqual(calls[0].body, { prompt: "Home" });
  assert.equal(result[0][0].json.taskId, "lyrics-pending");
  assert.equal(result[0][0].json.finished, false);
});

test("explicit processing group never becomes complete from nested success", () => {
  const result = taskResult({
    id: "one",
    state: "processing",
    response: {
      success: true,
      data: [{ audio_url: "https://cdn.acedata.cloud/one.mp3" }],
    },
  });
  assert.equal(result.finished, false);
  assert.equal(result.status, "processing");
});

test("custom mode omits optional empty title", async () => {
  const { ctx, calls } = context(
    {
      resource: "audio",
      operation: "create",
      prompt: "[Verse] Home",
      model: "acemusic-v1.1",
      custom: true,
      style: "folk",
    },
    { task_id: "one" },
  );
  await new AceMusic().execute.call(ctx);
  assert.equal(calls[0].body.title, undefined);
});

test("workflow pending branch queries original ID without resubmitting", () => {
  const workflow = require("../examples/generate-wait-get.json");
  const create = workflow.nodes.filter(
    (node) =>
      node.type.endsWith(".aceMusic") && node.parameters.operation === "create",
  );
  assert.equal(create.length, 1);
  const lookup = workflow.nodes.find(
    (node) => node.name === "Get original task",
  );
  assert.match(lookup.parameters.taskId, /Create once/);
  assert.equal(
    workflow.connections["Task finished"].main[1][0].node,
    "Wait before query",
  );
  assert.equal(
    workflow.connections["Wait before query"].main[0][0].node,
    "Get original task",
  );
});

test("compiled credential icon resolves inside the package", () => {
  const fs = require("node:fs"),
    path = require("node:path");
  const credential = new AceDataAceMusicApi();
  const icon = path.resolve(
    __dirname,
    "../dist/credentials",
    credential.icon.replace(/^file:/, ""),
  );
  assert.ok(fs.existsSync(icon));
});
