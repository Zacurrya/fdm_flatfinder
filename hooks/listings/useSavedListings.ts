import { SavedListingsContext, SavedListingsContextType } from "@context/SavedListingsContext";
import { useContext } from "react";

export const useSavedListings = (): SavedListingsContextType => {
    const context = useContext(SavedListingsContext);
    if (!context) {
        throw new Error("useSavedListings must be used within a SavedListingsProvider");
    }
    return context;
}
