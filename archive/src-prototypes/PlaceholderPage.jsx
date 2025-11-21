import React from "react";

export default function PlaceholderPage({
  title = "Coming Soon",
  description = "This page is a placeholder. The full feature is being wired up.",
  details,
  docsLink,
}) {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-slate-600 mb-4">{description}</p>

      {details && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
          <h2 className="font-semibold mb-1">What’s planned</h2>
          <ul className="list-disc ml-6 text-sm text-slate-700">
            {details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {docsLink && (
        <a
          href={docsLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm bg-white hover:bg-slate-50 border-slate-200"
        >
          View design/requirements
        </a>
      )}
    </div>
  );
}
