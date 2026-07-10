const ARIA_API_URL = process.env.ARIA_API_URL;
const ARIA_API_KEY = process.env.ARIA_API_KEY;

export type AriaPosition = {
  symbol: string;
  type: string;
  volume: number;
  profit: number;
};

export type AriaPositionsResponse = {
  equity: number | null;
  balance: number | null;
  positions: AriaPosition[];
};

export class AriaApiError extends Error {}

export async function getPositions(
  accountId: string
): Promise<AriaPositionsResponse> {
  const res = await fetch(
    `${ARIA_API_URL}/positions?account_id=${encodeURIComponent(accountId)}`,
    {
      headers: { "X-Api-Key": ARIA_API_KEY ?? "" },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AriaApiError(body.detail ?? `Aria API error (${res.status})`);
  }

  return res.json();
}

export async function chatWithAria(
  accountId: string,
  message: string
): Promise<string> {
  const res = await fetch(`${ARIA_API_URL}/chat`, {
    method: "POST",
    headers: {
      "X-Api-Key": ARIA_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ account_id: accountId, message }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AriaApiError(body.detail ?? `Aria API error (${res.status})`);
  }

  const data = await res.json();
  return data.reply as string;
}