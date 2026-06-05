# Adding Stories To Cinq Media

The homepage and Journal page read story cards from:

```text
data/stories.json
```

To add a new story, copy one existing object, paste it at the top or bottom of
the JSON array, then change the fields. The site sorts by `publishedAt`, so the
newest timestamp appears first automatically.

Use Nairobi time in ISO format:

```text
2026-05-31T09:40:00+03:00
```

Required fields:

- `id`: short unique slug, used in the detail page URL.
- `category`: story desk label, for example `Climate` or `Civic Desk`.
- `location`: place label shown in the card.
- `title`: headline.
- `deck`: short summary.
- `readMinutes`: estimated read time as a number.
- `publishedAt`: real publish timestamp in ISO format.
- `image`: image path, for example `images/market-economy-bw.jpg`.
- `alt`: accessible image description.
- `href`: usually `blog-single.html?story=your-story-id`.
- `tags`: short tag array for the story cards.
- `body`: paragraph array for the story detail page.

Example:

```json
{
  "id": "new-county-health-brief",
  "category": "Health",
  "location": "Kisumu",
  "title": "County health desk: what patients are asking this week.",
  "deck": "A short service story on access, wait times, registration, and patient questions.",
  "readMinutes": 5,
  "publishedAt": "2026-06-01T08:30:00+03:00",
  "image": "images/african-woman-portrait-bw.jpg",
  "alt": "Black-and-white portrait of a young African woman",
  "href": "blog-single.html?story=new-county-health-brief",
  "tags": ["Health", "Patient rights", "County desk"],
  "body": [
    "Reported first paragraph goes here.",
    "Reported second paragraph goes here."
  ]
}
```

For a bigger newsroom workflow later, replace this JSON file with a CMS, RSS
feed, Airtable, Google Sheet, or headless CMS API that outputs the same fields.
