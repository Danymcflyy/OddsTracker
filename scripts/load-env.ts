import path from "path";
import dotenv from "dotenv";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.ODDSPAPI_API_KEY) {
  dotenv.config({ path: ENV_PATH });
}
