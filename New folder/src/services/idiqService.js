export const IDIQ_PARTNER_TOKEN_URL =
  "https://getidiqpartnertoken-tvkxcewmxq-uc.a.run.app";

export async function getPartnerTokenViaHttp() {
  const res = await fetch(IDIQ_PARTNER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IDIQ HTTP error ${res.status}: ${text}`);
  }
  const data = await res.json(); // { success, token, expiresIn }
  if (!data?.success || !data?.token) {
    throw new Error("IDIQ token not returned");
  }
  return data.token;
}
