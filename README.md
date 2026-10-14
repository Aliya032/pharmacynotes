# Pharmacy Notes

Static Next.js site, deployed by Cloudflare Pages from `main` to https://pharmacynotes.pages.dev.

## Adding or changing uploads

1. Put the files in `public/files/`:
   - presentations: `public/files/presentations/<name>.pptx`
   - documents: `public/files/documents/<name>.pdf`
   - infographics: `public/files/infographics/<name>.png`
     Names: lowercase, words joined with hyphens, no spaces.
2. Make PDFs of new presentations (needs PowerPoint):
   `powershell -ExecutionPolicy Bypass -File scripts\pptx-to-pdf.ps1`
3. Add a row to `content/pharmacy-notes.xlsx` (file_name must match the file).
4. Run `npm run content`. It writes `content/uploads.json` and thumbnails, and lists anything to fix.
5. Check with `npm run dev`, then commit and push.
