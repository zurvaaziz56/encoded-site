# Visual spec format (for writers)

Write strict JSON (no comments, no trailing commas): {"posts": [ ... ]}. Each post:
{"id": "li-01", "channel": "linkedin|instagram|tiktok", "week": 1, "day": "Tue", "title": "short name", "format": "image|carousel|reel-cover", "slides": [ slide, ... ]}
- image: exactly 1 slide. carousel: 5 to 8 slides, first slide hooks, last slide is a CTA or a punchline. reel-cover: 1 slide, layout "cover" or "chat" or "meme" (rendered tall, 1080x1920).

Slide layouts (use the exact field names; keep text short: the image must be readable on a phone):
- {"layout":"cover","tag":"<=30 chars","title":"<=60 chars","sub":"<=90 chars"}
- {"layout":"before_after","tag":"","title":"<=50","bad":"<=90 AI line","good":"<=90 fixed line","rule":"<=40 e.g. Rule S2 · count = headline"}
- {"layout":"chat","tag":"","prompt":"<=90 what the user asked the AI","reply":"<=220 the AI's answer; wrap each mistake in [[double brackets]] so it gets a red underline","note":"<=60 punchline under the chat"}
- {"layout":"doc","tag":"","headline":"<=70 headline of the draft","lines":[{"text":"<=70","mark":"none|strike|flag","note":"<=22 margin note, only for strike/flag"}],"verdict":"<=40 e.g. FIX FIRST · 3 breaks"}   (3 to 5 lines)
- {"layout":"quiz","tag":"","title":"<=60 the headline being tested","question":"<=50","items":["<=40", ...],"answer_index":5}   (answer_index = 0-based index of the wrong item to highlight in red, or null for the question slide with no reveal)
- {"layout":"checklist","tag":"","title":"<=55","items":[{"text":"<=45","ok":true}]}   (3 to 6 items; ok=false shows a red cross)
- {"layout":"meme","panels":[{"label":"<=30","text":"<=90"}, {"label":"","text":""}]}   (2 or 3 panels, e.g. "Nobody:" / "The AI draft:")
- {"layout":"stat","tag":"","number":"<=6 chars","label":"<=50","sub":"<=80"}   (ONLY real numbers: $99, $249, 2 business days, 15 minutes, 6 files, 10 minutes setup, 8 stages, around 20 checks, 200+ episodes, 100+ Upwork projects, 2 years)
- {"layout":"quote","quote":"<=140","by":"<=40"}
- {"layout":"steps","tag":"","title":"<=50","steps":["<=50","<=50","<=50"]}
- {"layout":"files","tag":"","title":"<=50","items":["<=28", ...],"sub":"<=80"}   (up to 6 items)
- {"layout":"cta","tag":"","title":"<=60","sub":"<=90","button":"<=34"}

Rules: follow BRIEF.md (no em dashes anywhere, no hype words, no invented clients, results, testimonials or numbers; made-up example people and agencies must be obviously fictional, e.g. "Fernhill PR (made up)"). Use variety: no more than two posts in a row with the same first-slide layout. Make it witty and visual: chats, marked-up drafts, quizzes and memes beat plain text cards.
