import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Crit 4 spec: https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/04-instrument/
// Only the mechanically checkable lines get a test here. "Expressive", "any
// input feels good", and "explain your direction" are judged live at the crit
// — see the crit page for the full spec.

const home = new JSDOM(readFileSync(resolve("dist/index.html"), "utf8")).window.document;

describe("crit 4: an instrument", () => {
  it("ships no pre-recorded audio — sound must be synthesized live in the browser", () => {
    expect(
      home.querySelectorAll("audio, video").length,
      "the spec asks for sound made live in the page, not played back from a file",
    ).toBe(0);
  });

  it("invites the first sound from the opening screen", () => {
    const prompt = home.querySelector('[data-testid="play-prompt"]');
    expect(
      prompt?.textContent?.trim(),
      "a stranger should see, on load, what to do to make the first sound",
    ).toBeTruthy();
  });

  it("has no score or fail state", () => {
    const forbidden = ['[data-testid="score"]', '[data-testid="game-over"]'];
    for (const selector of forbidden) {
      expect(
        home.querySelector(selector),
        `${selector} suggests a score/fail state — the spec asks for no way to play it wrong`,
      ).toBeNull();
    }
  });
});
