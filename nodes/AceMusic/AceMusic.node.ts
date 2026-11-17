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
          if (operation !== "create")
            throw new NodeOperationError(
              this.getNode(),
              "Select a supported operation",
            );
          const prompt = requiredText(
            this.getNodeParameter("prompt", index),
            "Prompt",
          );
          if (resource === "lyrics") {
            const response = await request(
              this,
              "aceDataAceMusicApi",
              "/acemusic/lyrics",
              {
                prompt,
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
            const custom = this.getNodeParameter(
              "custom",
              index,
              false,
            ) as boolean;
            const body: IDataObject = {
              action: "generate",
              model: this.getNodeParameter("model", index) as string,
              async: true,
              custom,
            };
            if (custom) {
              body.lyric = prompt;
              const title = String(
                this.getNodeParameter("title", index, ""),
              ).trim();
              if (title) body.title = title;
              body.style = requiredText(
                this.getNodeParameter("style", index),
                "Style",
              );
            } else {
              body.prompt = prompt;
            }
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
