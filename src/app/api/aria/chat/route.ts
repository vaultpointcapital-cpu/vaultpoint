import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatWithAria, AriaApiError } from "@/lib/aria";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("metaapi_account_id")
    .eq("id", user.id)
    .single();

  if (!profile?.metaapi_account_id) {
    return NextResponse.json(
      { error: "No MetaApi account linked to this user yet." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const message = body?.message;

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Missing 'message' in request body." },
      { status: 400 }
    );
  }

  try {
    const reply = await chatWithAria(profile.metaapi_account_id, message);
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof AriaApiError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Unexpected error reaching Aria." },
      { status: 500 }
    );
  }
}