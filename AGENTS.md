<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Student/teacher login is custom (pseudonym + PIN, teacher password secret) with HMAC-signed tokens in `src/lib/session.server.ts`; no Supabase Auth, because minors must not provide e-mail (LGPD).
- All DB access goes through server functions in `src/lib/api.functions.ts` using the admin client; tables have RLS on with no policies, so the browser never reads data directly.
- Footprint scoring is deterministic in `src/lib/footprint.ts` (tested in `footprint.test.ts`); AI only writes feedback text.
