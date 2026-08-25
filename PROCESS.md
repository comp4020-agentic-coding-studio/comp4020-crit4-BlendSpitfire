# Process overview

<!-- TEMPLATE: this file is a shape to fill in, not a form. Replace everything
     in it with your own overview, and delete this comment — `pnpm
     check:evidence` will remind you if it's still here. -->

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

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

Jobs 2 and 3 are the ones the repo can't tell a reader on its own, so they're
where the marks are. The strongest moments are the ones where a correction
landed in the **harness** --- the standards and checks your work has to satisfy
--- rather than in a retry: a rule added to `CLAUDE.md`, a check wired up, an
attempt thrown away. Retrying until it passes is the routine case, and changing
what the work runs against is the skilled one.

Cite each moment as a link whose text is the commit hash or range and whose
target is this repo's commit or compare URL, so a reader clicks straight to the
evidence:

- one commit: [`a1b2c3d`](https://github.com/YOUR-ORG/YOUR-REPO/commit/a1b2c3d)
- a range:
  [`a1b2c3d...e4f5a6b`](https://github.com/YOUR-ORG/YOUR-REPO/compare/a1b2c3d...e4f5a6b)

To pair a prompt with the commit it produced, quote the prompt (curated, not a
full transcript) next to the citation:

> the prompt, verbatim

Screenshots are welcome where one carries the verification better than a
sentence does. Commit the file to this repo and link it with a **relative**
path, which is what makes it render on GitHub: `![alt text](docs/before.png)`.
Images don't count towards the word count and don't replace the citation.

### A worked moment, for shape

Delete this section along with the rest of the boilerplate --- it's here to show
the four jobs in one paragraph, not to be imitated in content.

> The date formatter kept coming back with `toLocaleDateString()` and no locale
> argument, so the same build rendered differently on my machine and in CI. I'd
> already re-prompted it twice, which fixed the line but not the habit, so the
> third time I put the rule in `CLAUDE.md` instead
> ([`3f9ac21`](https://github.com/YOUR-ORG/YOUR-REPO/commit/3f9ac21)) and added
> a spec test that fails on a bare `toLocaleDateString`. That's what told me it
> had actually taken: the test went red against the old code and green against
> the new, and the next two features it wrote passed it without prompting
> ([`3f9ac21...b7e0d14`](https://github.com/YOUR-ORG/YOUR-REPO/compare/3f9ac21...b7e0d14)).

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there --- before a marker ever opens the file. It checks that
your map is traceable, not that it is good: the marker judges whether your
small, deliberately chosen set of moments shows real judgement and reflection. A
green check is not a substitute for that curation.

Images aren't checked: whether one renders is visible the moment you look. Open
this file on GitHub and look at it before you ship.
