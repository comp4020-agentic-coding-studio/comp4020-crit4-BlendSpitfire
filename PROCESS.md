# Process overview

A reading-guide to how the work came together for the crit 4 prototype,
"Tap a Beat".

## What I built

A virtual drum kit you can play by tapping the pads or pressing the keyboard.

## The moments that mattered

1. **what happened** --- I was never satisfied with where the pads sat on the
   page; describing a position in words and waiting for a re-render was slow
   and imprecise.
2. **what you did instead of the obvious thing** --- Instead of continuing to
   adjust the layout through language, I had the AI build a small local tool:
   a page where I could drag each pad into place live. I arranged everything
   by hand, then had the AI read the resulting coordinates straight off it.
3. **how you knew it was right** --- It worked well: it cut the
   back-and-forth and the time spent on layout tweaks noticeably compared to
   describing positions in text.
4. **the citation** ---
   [`bbc5ead`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-BlendSpitfire/commit/bbc5ead3035eddee26082c8fcf0e70fba13662d8),
   using the layout editor at `tools/kit-editor/`.

