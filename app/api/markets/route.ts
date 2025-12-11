import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sportSlug = searchParams.get("sport");

  if (!sportSlug) {
    return NextResponse.json(
      { error: "Missing sport parameter" },
      { status: 400 }
    );
  }

  try {
    // Mapper slug → sport_id
    const { data: sport, error: sportError } = await supabaseAdmin
      .from("sports_v2")
      .select("id")
      .eq("slug", sportSlug)
      .single();

    if (sportError || !sport) {
      return NextResponse.json(
        { error: "Sport not found" },
        { status: 404 }
      );
    }

    // Charger marchés actifs
    const { data: markets, error: marketsError } = await supabaseAdmin
      .from("markets_v2")
      .select("id, oddsapi_key, market_type, period, handicap, sport_id")
      .eq("sport_id", sport.id)
      .eq("active", true)
      .order("market_type")
      .order("period")
      .order("handicap", { nullsFirst: true });

    if (marketsError) {
      return NextResponse.json(
        { error: marketsError.message },
        { status: 500 }
      );
    }

    // Charger les outcomes pour chaque marché
    const { data: outcomes, error: outcomesError } = await supabaseAdmin
      .from("outcomes_v2")
      .select("id, market_id, oddsapi_name, normalized_name, display_name");

    if (outcomesError) {
      return NextResponse.json(
        { error: outcomesError.message },
        { status: 500 }
      );
    }

    // Construire map outcomes par market_id
    const outcomesByMarket = new Map<string, any[]>();
    (outcomes || []).forEach((o: any) => {
      if (!outcomesByMarket.has(o.market_id)) {
        outcomesByMarket.set(o.market_id, []);
      }
      outcomesByMarket.get(o.market_id)!.push(o);
    });

    // Joindre les outcomes aux marchés
    const marketsWithOutcomes = (markets || []).map((m: any) => ({
      ...m,
      outcomes: outcomesByMarket.get(m.id) || []
    }));

    // Adapter le format pour l'UI (qui attend l'ancien format)
    const formattedMarkets = marketsWithOutcomes.map((m: any) => ({
      id: m.id,
      oddspapi_id: null,
      name: m.oddsapi_key,
      market_type: m.market_type,
      period: m.period,
      handicap: m.handicap,
      outcomes: m.outcomes.map((o: any) => ({
        id: o.id,
        oddspapi_id: null,
        name: o.normalized_name,
        description: o.display_name
      }))
    }));

    return NextResponse.json({ data: formattedMarkets });
  } catch (error) {
    console.error("[API /markets] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cache 1 heure (marchés changent rarement)
export const revalidate = 3600;
