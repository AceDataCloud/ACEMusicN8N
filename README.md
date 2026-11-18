# ACE Music by Ace Data Cloud for n8n

Create songs from an idea or custom lyrics, generate lyric drafts, and query the original task.

## Installation

After the first package release, install `@acedatacloud/n8n-nodes-acemusic` in n8n community nodes. This source PR does not imply npm publication or n8n Cloud verification.

## Credentials

Acquire ACE Music or an authorized global application at [Ace Data Cloud](https://platform.acedata.cloud/console/applications). Paste the API token without the Bearer prefix. The credential test only queries one task page and creates no music.

## Use the node

Choose Audio → Create. Use `acemusic-v1.1` or `acemusic-v1`. Idea mode accepts a prompt; Custom Lyrics uses Prompt as lyrics and requires both Style and Title. The create operation submits once and returns a task ID. Use Task → Get or Get Many after a Wait node, and continue querying that same ID until `finished` is true. Do not retry Create because a task is processing or a request times out.

Lyrics → Create returns an editable title/text draft. It is a separately billed operation and may return a task ID for later retrieval if processing takes longer.

One complete two-track group is charged once; final failed or partial groups are free. Queries are free, require authorization, and remain available at zero balance. Inspect `successful`, `status`, `error` and `data` before downloading completed audio. Audio → Upload imports one track from a public HTTPS audio URL as a separate priced operation; optional Name and Anchor Audio ID preserve an existing owned source for later reference use. Wait for its task to succeed before using the returned platform audio ID. Upload never creates a cover implicitly.

Audio → Cover uses one successful caller-owned platform audio ID; Audio → Mashup uses exactly two distinct compatible owned audio IDs. Both use `acemusic-v1.1`, require Lyrics and Style, and accept optional Title and Audio Influence 1–100 (default 60). Use the track ID in the task data, not its group task ID. The service validates ownership and reference compatibility. If sources are rejected, report the error without automatically importing or substituting them. Complete two-track reference generations are billed once; failed imports and failed/partial generation groups are free under current service rules. Extension, stems and voice parameters remain outside this release.

## Development

```sh
npm install --ignore-scripts
npm run build
npm run lint
npm test
npm pack --dry-run
```

The production API depends on the companion worker, gateway and Backend changes. See [API documentation](https://platform.acedata.cloud/documents/acemusic).

Import [the submit → Wait → get-original-task example](examples/generate-wait-get.json), set the ACE Music credential on both ACE Music nodes, and leave the Create node's automatic retry disabled. The pending branch loops only through Wait and Get. The example has a 15-minute execution timeout; retain the original task ID to resume a slow job.

Official ACE Music icons are downloaded from the immutable CDN asset in `brand-assets.json` during `npm run build`, verified by SHA256, and packaged into `dist`. Brand binary files are not stored in source.
