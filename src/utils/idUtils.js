import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const MAX_INITIALS = 3;
const MAX_ATTEMPTS = 10;

/**
 * Extract up to 3 uppercase initials from full name
 */
const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("")
        .slice(0, MAX_INITIALS);

/**
 * Generates a 2-digit random number with leading zeros (e.g., "045")
 */
const getRandomSuffix = () => String(Math.floor(Math.random() * 100)).padStart(2, "0");

/**
 * Generates a unique GIP ID using the format: GIP-<INITIALS>-<YEAR>-<RANDOM>
 *
 * @param {string} name - Full name (used for initials)
 * @param {string|Date} dateHired - Date Hired (used for year)
 * @returns {Promise<string>} - Unique GIP ID
 */
export const generateNextGipId = async (name = "", dateHired = "") => {
    if (!name || !dateHired) return "";

    let year;
    try {
        const date = new Date(dateHired);
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        year = date.getFullYear();
    } catch {
        console.error("⚠️ Invalid Date Hired for GIP ID generation.");
        return "";
    }

    const initials = getInitials(name);

    const snapshot = await getDocs(collection(db, "employees"));
    const existingIds = new Set(snapshot.docs.map((doc) => doc.data()?.gipId?.toUpperCase() || ""));

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const suffix = getRandomSuffix();
        const newId = `GIP-${initials}-${year}-${suffix}`.toUpperCase();
        if (!existingIds.has(newId)) {
            return newId;
        }
    }

    throw new Error("❌ Failed to generate a unique GIP ID after multiple attempts.");
};
