# ACE Music for n8n

Create songs from an idea or custom lyrics, generate lyric drafts, and query the original task. This package integrates only the ACE Music API, maintained by Ace Data Cloud, using one node and one credential. It does not bundle other model services.

## Installation

In a self-hosted n8n instance, open **Settings → Community Nodes → Install** and enter `@acedatacloud/n8n-nodes-acemusic`. The package is published on npm. n8n Cloud discovery requires separate verification by n8n; npm availability does not imply that approval.

## Credentials

Sign in to [Applications](https://platform.acedata.cloud/console/applications?utm_source=npm&utm_medium=referral&utm_campaign=evergreen) and open **General Application**. If it is missing, select **Initialize General Application**. Click the copy button to the right of **API KEY**.

![Copy the API key from General Application](https://cdn.acedata.cloud/dvc3cg.jpg)

Confirm the key can access ACE Music. In n8n, paste its raw value into **API Token** in the **ACE Music API** credential. n8n adds the `Bearer` prefix for you. The credential test queries a task page and creates no music.

## Use the node

Choose Audio → Create. The default model is `acemusic-v1.1`; choose **Additional Fields → Model** to use `acemusic-v1`. Idea mode accepts a prompt; Custom Lyrics uses Prompt as lyrics and requires both Style and Title. Optional lyric style, upload details, reference title and audio influence also appear under **Additional Fields** for the corresponding operation. Existing version 1 nodes keep their original fields and behavior; newly added nodes use version 1.1. The create operation submits once and returns a task ID. Use Task → Get or Get Many after a Wait node, and continue querying that same ID until `finished` is true. Do not retry Create because a task is processing or a request times out.

Lyrics → Create returns an editable title/text draft. It is a separately billed operation and may return a task ID for later retrieval if processing takes longer.

One complete two-track group is charged once; final failed or partial groups are free. Queries are free, require authorization, and remain available at zero balance. Inspect `successful`, `status`, `error` and `data` before downloading completed audio. Audio → Upload imports one MP3 track from a public HTTPS MP3 URL as a separate priced operation; optional Name and Anchor Audio ID preserve an existing owned source for later reference use. Wait for its task to succeed before using the returned platform audio ID. Upload never creates a cover implicitly.

Audio → Cover uses one successful caller-owned platform audio ID; Audio → Mashup uses exactly two distinct compatible owned audio IDs. Both use `acemusic-v1.1`, require Lyrics and Style, and accept optional Title and Audio Influence 1–100 (default 60). Use the track ID in the task data, not its group task ID. The service validates ownership and reference compatibility. If sources are rejected, report the error without automatically importing or substituting them. Complete two-track reference generations are billed once; failed imports and failed/partial generation groups are free under current service rules. Extension, stems and voice parameters remain outside this release.

## Development

```sh
npm install --ignore-scripts
npm run build
npm run lint
npm test
npm pack --dry-run
```

See [API documentation](https://platform.acedata.cloud/documents/acemusic?utm_source=npm&utm_medium=referral&utm_campaign=evergreen) and [current pricing](https://platform.acedata.cloud/models?utm_source=npm&utm_medium=referral&utm_campaign=evergreen). Installation is free; generation, lyric creation and audio uploads use the application balance.

Import [the submit → Wait → get-original-task example](examples/generate-wait-get.json), set the ACE Music credential on both ACE Music nodes, and leave the Create node's automatic retry disabled. The pending branch loops only through Wait and Get. The example has a 15-minute execution timeout; retain the original task ID to resume a slow job.

The source includes the official ACE Music icons from the immutable CDN asset in `brand-assets.json`. `npm run build` verifies their SHA256 and packages them into `dist`. Keeping the same icons in source also lets n8n validate the attested GitHub source before running a build.
