import { render, screen } from "@testing-library/react";
import { ParticipantsSummary } from "./ParticipantsSummary";
import { describe, it, expect } from "vitest";

describe("ParticipantsSummary", () => {
    it("renders empty state when participants is null", () => {
        render(<ParticipantsSummary participants={null} />);
        expect(screen.getByText("Liste vide pour le moment.")).toBeDefined();
    });

    it("renders empty state when participants is undefined", () => {
        render(<ParticipantsSummary />);
        expect(screen.getByText("Liste vide pour le moment.")).toBeDefined();
    });

    it("renders no participants state when participants is an empty array", () => {
        render(<ParticipantsSummary participants="[]" />);
        expect(screen.getByText("Aucun participant inscrit.")).toBeDefined();
    });

    it("renders no participants state when participants is not an array", () => {
        render(<ParticipantsSummary participants="{}" />);
        expect(screen.getByText("Aucun participant inscrit.")).toBeDefined();
    });

    it("renders participants correctly when valid JSON is provided", () => {
        const participants = [
            { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
            { name: "Jane", lastName: "Smith" }
        ];
        render(<ParticipantsSummary participants={JSON.stringify(participants)} />);

        // John Doe checks
        expect(screen.getByText("JD")).toBeDefined();
        expect(screen.getByText("John Doe")).toBeDefined();
        expect(screen.getByText("john.doe@example.com")).toBeDefined();

        // Jane Smith checks
        // The component's initials logic uses `p.firstName?.[0] || ""`, so for "name" instead of "firstName", it's empty, and just gets "S" from lastName.
        expect(screen.getByText("S")).toBeDefined();
        expect(screen.getByText("Jane Smith")).toBeDefined();
    });

    it("renders fallback initials when names are not provided", () => {
        const participants = [{ email: "test@example.com" }];
        render(<ParticipantsSummary participants={JSON.stringify(participants)} />);

        expect(screen.getByText("P")).toBeDefined(); // Fallback initial 'P'
        expect(screen.getByText("test@example.com")).toBeDefined();
    });

    it("renders error state when participants is invalid JSON", () => {
        render(<ParticipantsSummary participants="[invalid_json]" />);
        expect(screen.getByText("Erreur de format des participants")).toBeDefined();
    });
});
