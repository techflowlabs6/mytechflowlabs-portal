# Citrus & Ink release and recovery

## Exact baseline

- Repository: `techflowlabs6/mytechflowlabs-portal`
- Original main commit: `7794688adfb6e963c41704cc6f5b71aeb086651b`
- Local baseline branch: `backup/pre-citrus-7794688`
- Redesign branch: `feat/citrus-ink`

The redesign is a new child commit of the baseline. No existing commits are amended, rebased, removed, or force-pushed. The delivery includes a Git bundle containing the baseline history and redesign branch, so both versions can be recovered independently of the working directory.

## Publishing

Push the baseline branch, then fast-forward main to the tested redesign commit. If main has advanced independently, fetch and reconcile those changes before updating it. Do not force-push main. The existing hosting integration remains responsible for automatic deployment.

## Roll back a deployed release without losing history

On main, use `git log --oneline` to find the commit titled `feat: launch Citrus and Ink portal with Lexi and responsive motion`. Run `git revert --no-edit` with that exact commit SHA, then push main. This creates a new rollback commit and keeps the full history. The exact redesign SHA is also provided with the delivery.

For inspection only, `git switch -c recovery/pre-citrus 7794688adfb6e963c41704cc6f5b71aeb086651b` opens the exact previous design in a separate branch.

## Data compatibility

The original `mytechflow_apps_v2` and `mytechflow_admin_clean` local-storage keys remain in use. The new `mytechflow_citrus_v1` marker prevents repeated automatic addition of Lexi. Saved names, links, descriptions, custom cards, artwork overrides, and post-migration deletions are preserved. No database schema or backend files are changed.

## Verification

- Eight automated tests cover migration, customized/shortened collections, persistence of deletions, corrupt/unavailable storage, accent-aware search, category combinations, safe link protocols, and custom artwork preservation.
- Production Vite build and whitespace checks pass.
- Browser verification covers search/empty states, app details, native dialog Escape/focus restoration, mobile navigation, local admin add/edit/delete/reload, offline/reconnection feedback, and responsive widths from 320 to 1440 CSS pixels.
- Narrow-phone horizontal overflow found during testing was corrected.
- Application-scoped browser errors were checked; extension-generated errors are outside application scope.

The existing email/one-click local admin behavior is preserved. It is not a production server authentication system. The change does not claim that externally hosted apps work offline or guarantee the absence of every possible bug.
