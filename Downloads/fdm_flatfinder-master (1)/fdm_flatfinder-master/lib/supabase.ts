import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { Database } from "../types/database.types";

// Use AsyncStorage on native, and let Supabase default to localStorage on web.
// AsyncStorage accesses `window` which doesn't exist during SSR, so skip it on web.
const storage = Platform.OS === "web" ? undefined : AsyncStorage;

export const supabase = createClient<Database>(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            storage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: Platform.OS === "web",
        },
    }
);
