import { NodeConnectionTypes, NodeOperationError } from "n8n-workflow";
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import {
  failure,
  object,
  output,
  request,
  requiredText,
  submissionResult,
  taskResult,
} from "./helpers";
import { properties } from "./properties";

export class AceMusic implements INodeType {
  description: INodeTypeDescription = {
    displayName: "ACE Music by Ace Data Cloud",
    name: "aceMusic",
    icon: { light: "file:icon.png", dark: "file:icon.dark.png" },
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      "Create ACE Music songs and lyrics, then retrieve the same task through Ace Data Cloud",
    defaults: { name: "ACE Music by Ace Data Cloud" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "aceDataAceMusicApi", required: true }],
    codex: {
      alias: ["ace music", "acemusic", "music generation"],
      categories: ["Marketing & Content"],
      resources: {
        primaryDocumentation: [
          {
            url: "https://github.com/AceDataCloud/ACEMusicN8N#use-the-node",
          },
        ],
        credentialDocumentation: [
          {
            url: "https://github.com/AceDataCloud/ACEMusicN8N#credentials",
          },
        ],
      },
    },
    properties,
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const result: INodeExecutionData[] = [];
    for (let index = 0; index < items.length; index++) {
      try {
        const resource = this.getNodeParameter("resource", index) as string;
        const operation = this.getNodeParameter("operation", index) as string;
        const simplify = this.getNodeParameter(
          "simplify",
          index,
          true,
        ) as boolean;
        if (resource === "task") {
          let body: IDataObject;
          if (operation === "get") {
            body = {
              action: "retrieve",
              id: requiredText(
                this.getNodeParameter("taskId", index),
                "Task ID",
              ),
            };
          } else if (operation === "getMany") {
            const ids = requiredText(
              this.getNodeParameter("taskIds", index),
              "Task IDs",
            )
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean);
            if (!ids.length || ids.length > 100)
              throw new NodeOperationError(
                this.getNode(),
                "Provide between 1 and 100 task IDs",
              );
            body = { action: "retrieve_batch", ids };
          } else {
            throw new NodeOperationError(
              this.getNode(),
              "Select a supported task operation",
            );
          }
          const response = await request(
            this,
            "aceDataAceMusicApi",
            "/acemusic/tasks",
            body,
          );
          const records = operation === "getMany" ? response.items : [response];
          if (!Array.isArray(records))
            throw new NodeOperationError(
              this.getNode(),
              "The service returned an unexpected task list",
            );
          const valid = records.map((record) => object(record));
          if (valid.some((record) => !record.id && !record.task_id))
            throw new NodeOperationError(
              this.getNode(),
              "The task was not found. Check the task ID and service credential",
            );
          result.push(
            ...output(
              this,
              valid.map((record) => (simplify ? taskResult(record) : record)),
              index,
            ),
          );
        } else {
          if (resource === "lyrics" && operation !== "create")
            throw new NodeOperationError(
              this.getNode(),
              "Select a supported lyrics operation",
            );
          if (resource === "lyrics") {
            const response = await request(
              this,
              "aceDataAceMusicApi",
              "/acemusic/lyrics",
              {
                prompt: requiredText(
                  this.getNodeParameter("prompt", index),
                  "Prompt",
                ),
                ...(String(
                  this.getNodeParameter("lyricsStyle", index, ""),
                ).trim()
                  ? {
                      style: String(
                        this.getNodeParameter("lyricsStyle", index, ""),
                      ).trim(),
                    }
                  : {}),
              },
            );
            result.push(
              ...output(
                this,
                [
                  simplify
                    ? response.data !== undefined
                      ? taskResult(response)
                      : submissionResult(response)
                    : response,
                ],
                index,
              ),
            );
          } else if (resource === "audio") {
            const body: IDataObject = { async: true };
            if (operation === "create") {
              const prompt = requiredText(
                this.getNodeParameter("prompt", index),
                "Prompt",
              );
              const custom = this.getNodeParameter(
                "custom",
                index,
                false,
              ) as boolean;
              Object.assign(body, {
                action: "generate",
                model: this.getNodeParameter("model", index),
                custom,
              });
              if (custom) {
                body.lyric = prompt;
                body.title = requiredText(
                  this.getNodeParameter("title", index),
                  "Title",
                );
                body.style = requiredText(
                  this.getNodeParameter("style", index),
                  "Style",
                );
              } else body.prompt = prompt;
            } else if (operation === "upload") {
              const audioUrl = requiredText(
                this.getNodeParameter("audioUrl", index),
                "Audio URL",
              );
              const parsed = new URL(audioUrl);
              if (
                parsed.protocol !== "https:" ||
                parsed.username ||
                parsed.password
              )
                throw new NodeOperationError(
                  this.getNode(),
                  "A public HTTPS audio URL without credentials is required",
                );
              Object.assign(body, { action: "upload", audio_url: audioUrl });
              const name = String(
                this.getNodeParameter("uploadName", index, ""),
              ).trim();
              const anchor = String(
                this.getNodeParameter("anchorAudioId", index, ""),
              ).trim();
              if (name) body.name = name;
              if (anchor) body.audio_id = anchor;
            } else if (["cover", "mashup"].includes(operation)) {
              const influence = this.getNodeParameter(
                "audioInfluence",
                index,
                60,
              ) as number;
              if (
                !Number.isFinite(influence) ||
                influence < 1 ||
                influence > 100
              )
                throw new NodeOperationError(
                  this.getNode(),
                  "Audio Influence must be a number from 1 to 100",
                );
              Object.assign(body, {
                action: operation,
                model: "acemusic-v1.1",
                lyric: requiredText(
                  this.getNodeParameter("referenceLyric", index),
                  "Lyrics",
                ),
                style: requiredText(
                  this.getNodeParameter("referenceStyle", index),
                  "Style",
                ),
                audio_influence: influence,
              });
              const title = String(
                this.getNodeParameter("referenceTitle", index, ""),
              ).trim();
              if (title) body.title = title;
              if (operation === "cover")
                body.audio_id = requiredText(
                  this.getNodeParameter("audioId", index),
                  "Audio ID",
                );
              else {
                const ids = requiredText(
                  this.getNodeParameter("mashupAudioIds", index),
                  "Audio IDs",
                )
                  .split(",")
                  .map((id) => id.trim())
                  .filter(Boolean);
                if (ids.length !== 2 || new Set(ids).size !== 2)
                  throw new NodeOperationError(
                    this.getNode(),
                    "Provide exactly two distinct platform audio IDs",
                  );
                body.mashup_audio_ids = ids;
              }
            } else
              throw new NodeOperationError(
                this.getNode(),
                "Select a supported audio operation",
              );
            const response = await request(
              this,
              "aceDataAceMusicApi",
              "/acemusic/audios",
              body,
            );
            const normalized = submissionResult(response);
            result.push(
              ...output(this, [simplify ? normalized : response], index),
            );
          } else {
            throw new NodeOperationError(
              this.getNode(),
              "Select a supported resource",
            );
          }
        }
      } catch (error) {
        result.push(failure(this, error, index));
      }
    }
    return [result];
  }
}
