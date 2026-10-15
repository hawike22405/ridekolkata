export const MAX_MODEL_BYTES = 50 * 1024 * 1024;
export function inspectModel(bytes: ArrayBuffer) {
  const view = new DataView(bytes);
  let json: any;
  if (bytes.byteLength >= 20 && view.getUint32(0, true) === 0x46546c67) {
    if (
      view.getUint32(4, true) !== 2 ||
      view.getUint32(8, true) !== bytes.byteLength ||
      view.getUint32(16, true) !== 0x4e4f534a
    )
      throw new Error("Invalid GLB header.");
    const length = view.getUint32(12, true);
    if (length > bytes.byteLength - 20)
      throw new Error("Invalid GLB JSON chunk.");
    json = JSON.parse(
      new TextDecoder().decode(new Uint8Array(bytes, 20, length)),
    );
  } else json = JSON.parse(new TextDecoder().decode(bytes));
  if (!json || json.asset?.version !== "2.0")
    throw new Error("Only glTF 2.0 models are supported.");
  if ((json.nodes?.length ?? 0) > 3000)
    throw new Error("Model has too many objects.");
  let vertices = 0;
  for (const accessor of json.accessors ?? []) {
    if (!Number.isSafeInteger(accessor.count) || accessor.count < 0)
      throw new Error("Invalid model accessor.");
    if (accessor.type === "VEC3") vertices += accessor.count;
  }
  if (vertices > 3_000_000)
    throw new Error("Model exceeds the accessor budget.");
  if ((json.images?.length ?? 0) > 64)
    throw new Error("Model has too many textures.");
  let allocated = 0;
  for (const buffer of json.buffers ?? []) {
    if (!Number.isSafeInteger(buffer.byteLength) || buffer.byteLength < 0)
      throw new Error("Invalid model buffer.");
    allocated += buffer.byteLength;
  }
  if (allocated > MAX_MODEL_BYTES)
    throw new Error("Model buffers exceed 50 MiB.");
  for (const resource of [...(json.buffers ?? []), ...(json.images ?? [])])
    if (resource.uri && !/^data:/.test(resource.uri))
      throw new Error(
        "Upload a self-contained GLB or glTF with embedded resources.",
      );
  return json;
}
export async function fetchModel(url: string, signal: AbortSignal) {
  const res = await fetch(url, { signal, credentials: "omit" });
  if (!res.ok) throw new Error(`Model request failed (${res.status}).`);
  if (Number(res.headers.get("content-length")) > MAX_MODEL_BYTES)
    throw new Error("Model exceeds 50 MiB.");
  if (!res.body) throw new Error("Model response is empty.");
  const reader = res.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_MODEL_BYTES) throw new Error("Model exceeds 50 MiB.");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel();
    throw error;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  inspectModel(bytes.buffer);
  return bytes.buffer;
}
