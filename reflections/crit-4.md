# Crit 4 reflection

## What was the breakthrough that moved the work forward?

I kept getting stuck iterating on the drum kit's pad layout by describing
positions in words and waiting for the AI to re-render — slow, and the result
never quite matched what I had in mind. The breakthrough was giving up on
words for that part entirely: I had the AI build a small local page where I
could drag each pad into place directly, and once I had it looking right by
eye, the AI read the coordinates straight off the page instead of me
describing them. That turned a fuzzy, multi-round negotiation into a single
pass of direct manipulation followed by one read.

## What did this work change about who I want to be as a software developer?

It sharpened when to hand a problem to a tool instead of to language. Some
things — exact visual placement, spacing that "looks right" — are much
easier to specify by doing than by describing, even when an AI is doing the
building. I want to keep noticing that gap: build a tiny throwaway tool to
capture the answer directly, rather than iterating blindly through a
conversational back-and-forth that costs more time and produces a worse
result.
