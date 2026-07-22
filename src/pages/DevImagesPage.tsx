import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  cloudinaryConfig,
  createCloudinaryUrl,
  resolveCloudinaryPublicId,
} from "@/lib/cloudinary";
import {
  ABOUT_HERO_ID,
  ABOUT_IMAGE_IDS,
  BLOG_IMAGE_IDS,
  CTA_IMAGE_ID,
  HERO_IMAGE_ID,
  PROJECT_IMAGE_IDS,
  SERVICE_IMAGE_IDS,
  galleryProjects,
} from "@/lib/images";

type ProbeStatus = "idle" | "loading" | "ok" | "error";
interface ProbeResult {
  publicId: string;
  url: string;
  resolved: string;
  status: ProbeStatus;
  httpStatus?: number;
  ms?: number;
  source: string;
}

const gatherSamples = () => {
  const items: { publicId: string; source: string }[] = [];
  const push = (source: string, ids: string[]) =>
    ids.forEach((id) => items.push({ publicId: id, source }));

  push("Hero", [HERO_IMAGE_ID]);
  push("About Hero", [ABOUT_HERO_ID]);
  push("CTA", [CTA_IMAGE_ID]);
  push("Projects", PROJECT_IMAGE_IDS);
  push("Services", SERVICE_IMAGE_IDS);
  push("Blog", BLOG_IMAGE_IDS);
  push("About", ABOUT_IMAGE_IDS);
  galleryProjects.forEach((p) => {
    push(`Gallery cover · ${p.id}`, [p.coverImageId]);
    push(`Gallery first · ${p.id}`, [p.imageIds[0]]);
  });

  const seen = new Set<string>();
  return items.filter((i) => {
    const k = `${i.publicId}|${i.source}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const gatherAllProjectImages = () => {
  const items: { publicId: string; source: string }[] = [];
  galleryProjects.forEach((p) => {
    items.push({ publicId: p.coverImageId, source: `Cover · ${p.id}` });
    p.imageIds.forEach((id, idx) =>
      items.push({ publicId: id, source: `${p.id} · #${idx + 1}` }),
    );
  });
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = `${i.publicId}|${i.source}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const classifyError = (httpStatus?: number) => {
  if (!httpStatus) return "Network / CORS / unreachable";
  if (httpStatus === 404) return "Not found (404) — missing asset or wrong public_id";
  if (httpStatus === 401 || httpStatus === 403)
    return `Permission denied (${httpStatus}) — asset is private or delivery restricted`;
  if (httpStatus === 420 || httpStatus === 429)
    return `Rate limited (${httpStatus})`;
  if (httpStatus >= 500) return `Cloudinary server error (${httpStatus})`;
  return `HTTP ${httpStatus}`;
};

const DevImagesPage = () => {
  const samples = useMemo(gatherSamples, []);
  const [results, setResults] = useState<ProbeResult[]>(() =>
    samples.map((s) => ({
      publicId: s.publicId,
      source: s.source,
      url: createCloudinaryUrl(s.publicId, { width: 400 }),
      resolved: resolveCloudinaryPublicId(s.publicId),
      status: "idle" as ProbeStatus,
    })),
  );
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<string>("");

  const probeList = async (
    list: { publicId: string; source: string }[],
  ): Promise<ProbeResult[]> =>
    Promise.all(
      list.map(async (s) => {
        const url = createCloudinaryUrl(s.publicId, { width: 400 });
        const resolved = resolveCloudinaryPublicId(s.publicId);
        const start = performance.now();
        try {
          const res = await fetch(url, { method: "GET", mode: "cors" });
          return {
            publicId: s.publicId,
            source: s.source,
            url,
            resolved,
            status: (res.ok ? "ok" : "error") as ProbeStatus,
            httpStatus: res.status,
            ms: Math.round(performance.now() - start),
          };
        } catch {
          const ok = await new Promise<boolean>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
          });
          return {
            publicId: s.publicId,
            source: s.source,
            url,
            resolved,
            status: (ok ? "ok" : "error") as ProbeStatus,
            ms: Math.round(performance.now() - start),
          };
        }
      }),
    );

  const runProbe = async () => {
    setRunning(true);
    setReport("");
    setResults((prev) => prev.map((r) => ({ ...r, status: "loading" })));
    const updated = await probeList(samples);
    setResults(updated);
    setRunning(false);
  };

  const runFullProjectAudit = async () => {
    setRunning(true);
    setReport("Running full project image audit…");
    const list = gatherAllProjectImages();
    setResults(
      list.map((s) => ({
        publicId: s.publicId,
        source: s.source,
        url: createCloudinaryUrl(s.publicId, { width: 400 }),
        resolved: resolveCloudinaryPublicId(s.publicId),
        status: "loading" as ProbeStatus,
      })),
    );
    const probed = await probeList(list);
    setResults(probed);

    const failed = probed.filter((r) => r.status === "error");
    const byReason = new Map<string, ProbeResult[]>();
    failed.forEach((r) => {
      const key = classifyError(r.httpStatus);
      if (!byReason.has(key)) byReason.set(key, []);
      byReason.get(key)!.push(r);
    });

    const lines: string[] = [];
    lines.push(`Luxury Finishing — Project Images Audit`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(
      `Cloud: ${cloudinaryConfig.cloudName} · Folder: ${cloudinaryConfig.assetFolder}`,
    );
    lines.push(
      `Total: ${probed.length} · OK: ${probed.length - failed.length} · Failed: ${failed.length}`,
    );
    lines.push("");
    if (failed.length === 0) {
      lines.push("✅ All project images loaded successfully.");
    } else {
      for (const [reason, group] of byReason) {
        lines.push(`── ${reason} (${group.length}) ──`);
        group.forEach((r) => {
          lines.push(`  • [${r.source}] ${r.resolved}`);
          lines.push(`    ${r.url}`);
        });
        lines.push("");
      }
    }
    setReport(lines.join("\n"));
    setRunning(false);
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-audit-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    runProbe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const okCount = results.filter((r) => r.status === "ok").length;
  const errCount = results.filter((r) => r.status === "error").length;
  const loadingCount = results.filter((r) => r.status === "loading").length;

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="ltr">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Image Diagnostics</h1>
            <p className="text-sm text-muted-foreground">
              Probes Cloudinary URLs used across the site and flags 404s.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              ← Home
            </Link>
            <button
              onClick={runProbe}
              disabled={running}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              {running ? "Probing…" : "Re-run sample probe"}
            </button>
            <button
              onClick={runFullProjectAudit}
              disabled={running}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {running ? "Auditing…" : "▶ Test all project images"}
            </button>
          </div>
        </header>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cloudinary configuration
          </h2>
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            {[
              ["Cloud name", cloudinaryConfig.cloudName],
              ["Asset folder", cloudinaryConfig.assetFolder || "(none)"],
              [
                "Use folder as public_id prefix",
                String(cloudinaryConfig.useAssetFolderAsPublicIdPrefix),
              ],
              ["Upload preset", cloudinaryConfig.uploadPreset || "(unset)"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 rounded border bg-background/50 px-3 py-2">
                <span className="text-muted-foreground">{k}</span>
                <code className="text-xs">{v}</code>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Base URL:{" "}
            <code className="text-xs">
              https://res.cloudinary.com/{cloudinaryConfig.cloudName}/image/upload/…
            </code>
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total" value={results.length} tone="muted" />
          <StatCard label="OK" value={okCount} tone="ok" />
          <StatCard label="404 / Error" value={errCount} tone="err" />
          <StatCard label="Loading" value={loadingCount} tone="muted" />
        </section>

        <section className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Public ID</th>
                <th className="px-3 py-2">Resolved</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">ms</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={`${r.publicId}-${i}`}
                  className={
                    r.status === "error"
                      ? "border-t bg-destructive/5"
                      : "border-t"
                  }
                >
                  <td className="px-3 py-2">
                    <StatusPill status={r.status} httpStatus={r.httpStatus} />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.source}</td>
                  <td className="px-3 py-2">
                    <code className="text-xs">{r.publicId}</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="text-xs text-muted-foreground">{r.resolved}</code>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline underline-offset-2"
                      >
                        open
                      </a>
                      <button
                        onClick={() => copy(r.url)}
                        className="rounded border px-1.5 py-0.5 text-[10px] hover:bg-muted"
                      >
                        copy
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.ms ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {errCount > 0 && (
          <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <h3 className="mb-2 font-semibold text-destructive">Suggested fixes</h3>
            <ul className="list-disc space-y-1 pr-4 text-muted-foreground">
              <li>
                Verify the correct <code>VITE_CLOUDINARY_CLOUD_NAME</code> in <code>.env</code>.
              </li>
              <li>
                If assets sit at the account root, set{" "}
                <code>VITE_CLOUDINARY_USE_ASSET_FOLDER_PREFIX=false</code>.
              </li>
              <li>
                Otherwise upload the missing folders (<code>retail-interiors/</code>,{" "}
                <code>shops/</code>, <code>abuauf/</code>, <code>about/</code>) to the
                Cloudinary account.
              </li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "err" | "muted";
}) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    <div
      className={
        "mt-1 text-2xl font-bold " +
        (tone === "ok"
          ? "text-emerald-500"
          : tone === "err"
            ? "text-destructive"
            : "")
      }
    >
      {value}
    </div>
  </div>
);

const StatusPill = ({
  status,
  httpStatus,
}: {
  status: ProbeStatus;
  httpStatus?: number;
}) => {
  const map: Record<ProbeStatus, string> = {
    idle: "bg-muted text-muted-foreground",
    loading: "bg-muted text-muted-foreground animate-pulse",
    ok: "bg-emerald-500/15 text-emerald-600",
    error: "bg-destructive/15 text-destructive",
  };
  const label =
    status === "ok"
      ? httpStatus
        ? `OK ${httpStatus}`
        : "OK"
      : status === "error"
        ? httpStatus
          ? `ERR ${httpStatus}`
          : "ERR"
        : status;
  return (
    <span className={"inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase " + map[status]}>
      {label}
    </span>
  );
};

export default DevImagesPage;
