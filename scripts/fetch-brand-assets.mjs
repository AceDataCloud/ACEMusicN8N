import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const maxBytes = 2 * 1024 * 1024;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function verifyIcon(data, sha256) {
  if (data.length > maxBytes || !data.subarray(0, 8).equals(pngSignature)) {
    throw new Error("The official ACE Music icon is not a supported PNG");
  }
  if (createHash("sha256").update(data).digest("hex") !== sha256) {
    throw new Error(
      "The official ACE Music icon SHA256 does not match the pinned asset",
    );
  }
  return data;
}

export async function prepareIcon() {
  const { icon } = JSON.parse(
    await readFile(resolve(root, "brand-assets.json"), "utf8"),
  );
  if (!icon.url.startsWith("https://cdn.acedata.cloud/")) {
    throw new Error("Package icons must come from the Ace Data Cloud CDN");
  }
  let data;
  try {
    data = verifyIcon(
      await readFile(resolve(root, "nodes/AceMusic/icon.png")),
      icon.sha256,
    );
  } catch {
    const response = await fetch(icon.url, {
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(
        `Official icon download returned HTTP ${response.status}`,
      );
    const declared = Number(response.headers.get("content-length"));
    if (declared > maxBytes)
      throw new Error("The official icon exceeds the package size limit");
    data = verifyIcon(Buffer.from(await response.arrayBuffer()), icon.sha256);
  }
  const destination = resolve(root, "nodes/AceMusic");
  await mkdir(destination, { recursive: true });
  for (const name of ["icon.png", "icon.dark.png"])
    await writeFile(resolve(destination, name), data);
  console.log("Verified official ACE Music icon prepared for n8n build");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await prepareIcon();
}
