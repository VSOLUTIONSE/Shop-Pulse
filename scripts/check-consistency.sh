#!/usr/bin/env bash
# check-consistency.sh
#
# Grep-based guardrail checks. Fast, no build step, catches the drift that
# linters don't: duplicate components, bypassed SOT files, hardcoded tokens.
# Run before every commit; CI runs this too (.github/workflows/ci.yml).

set -euo pipefail
FAIL=0

fail() {
  echo "❌ $1"
  FAIL=1
}

pass() {
  echo "✅ $1"
}

echo "── Checking components/ui barrel exports ──"
for f in src/components/ui/*.tsx; do
  name=$(basename "$f" .tsx)
  if ! grep -q "\"./$name\"" src/components/ui/index.ts; then
    fail "src/components/ui/$name.tsx exists but isn't exported from index.ts — either export it or it shouldn't be there"
  fi
done
[ "$FAIL" -eq 0 ] && pass "every ui component is exported from the barrel"

echo "── Checking for duplicate component names (e.g. Button + ButtonV2) ──"
dupes=$(find src/components/ui -iname "*.tsx" -exec basename {} \; \
  | sed -E 's/(v2|new|copy|-[0-9]+)?\.tsx$//i' \
  | sort | uniq -d)
if [ -n "$dupes" ]; then
  fail "possible duplicate component pattern detected: $dupes"
else
  pass "no duplicate-looking component names"
fi

echo "── Checking for raw fetch() outside api-client.ts ──"
if grep -rn "fetch(" src/app src/components --include="*.ts" --include="*.tsx" \
   2>/dev/null | grep -v "src/lib/api-client.ts"; then
  fail "found fetch() outside src/lib/api-client.ts — route it through the shared client"
else
  pass "no stray fetch() calls"
fi

echo "── Checking for repeated raw className strings (extract to a component/variant) ──"
set +e
python3 - <<'PY'
import re, glob, collections, sys

pattern = re.compile(r'className="([^"]{25,})"')  # only long-ish strings matter
seen = collections.defaultdict(list)

for path in glob.glob("src/**/*.tsx", recursive=True):
    with open(path) as f:
        for line_no, line in enumerate(f, 1):
            for match in pattern.findall(line):
                normalized = " ".join(sorted(match.split()))
                seen[normalized].append(f"{path}:{line_no}")

failed = False
for classes, locations in seen.items():
    if len(locations) > 1:
        failed = True
        print(f"❌ identical className string repeated {len(locations)}x — extract it:")
        print(f"   \"{classes}\"")
        for loc in locations:
            print(f"     {loc}")

if not failed:
    print("✅ no repeated raw className strings found")
sys.exit(1 if failed else 0)
PY
PY_EXIT=$?
set -e
if [ "$PY_EXIT" -ne 0 ]; then FAIL=1; fi

echo "── Checking for arbitrary Tailwind values (hardcoded hex/px) ──"
if grep -rnE "(text|bg|border)-\[#[0-9a-fA-F]{3,6}\]" src/app src/components \
   --include="*.tsx" 2>/dev/null; then
  fail "found an arbitrary hex color value — add it to the @theme block in src/app/globals.css instead"
else
  pass "no arbitrary hex values in className"
fi

echo "── Checking for @ts-ignore / eslint-disable ──"
if grep -rn "@ts-ignore\|eslint-disable" src --include="*.ts" --include="*.tsx" \
   2>/dev/null | grep -v "eslint-disable-next-line no-console -- see"; then
  fail "found a suppressed error — fix the underlying issue or report it, don't suppress it"
else
  pass "no suppressed type/lint errors"
fi

echo "── Checking auth routes call requireAuth/requireAuthApi/requireRole ──"
for f in $(find src/app -path "*/api/*/route.ts" 2>/dev/null); do
  if ! grep -q "requireAuth\|requireRole\|handlers" "$f"; then
    echo "⚠️  $f doesn't call requireAuth()/requireAuthApi()/requireRole() — confirm this route is meant to be public"
  fi
done
pass "auth route scan complete (warnings above are not hard failures — confirm manually)"

echo "── Checking for direct process.env usage outside lib/env.ts ──"
if grep -rn "process\.env\." src --include="*.ts" --include="*.tsx" \
   2>/dev/null | grep -v "src/lib/env.ts"; then
  fail "found direct process.env access — import { env } from '@/lib/env' instead"
else
  pass "no direct process.env access outside env.ts"
fi

echo "── Checking proxy.ts stays thin (no auth/db logic at this layer) ──"
if [ -f "src/proxy.ts" ]; then
  if grep -E '^\s*import .* from "@/lib/auth"' src/proxy.ts >/dev/null \
     || grep -qE 'prisma|drizzle|await db\.' src/proxy.ts; then
    fail "src/proxy.ts appears to import the full auth config or hit a database — this belongs in src/lib/auth/guard.ts instead. proxy.ts should only check cookie presence (see .instructions/auth.instructions.md)"
  else
    pass "src/proxy.ts stays thin (no auth config or db imports found)"
  fi
else
  echo "⚠️  no src/proxy.ts found — if this app has protected routes, confirm route protection exists somewhere"
fi

echo "── Checking tokens.ts colors haven't drifted from globals.css @theme ──"
if [ -f "src/lib/design-system/tokens.ts" ] && [ -f "src/app/globals.css" ]; then
  set +e
  python3 - <<'PY'
import re, sys

with open("src/lib/design-system/tokens.ts") as f:
    ts_content = f.read()
with open("src/app/globals.css") as f:
    css_content = f.read()

# Pull out hsl(...) values from tokens.ts's simple `key: "hsl(...)"` lines
ts_values = set(re.findall(r'hsl\([^)]+\)', ts_content))
css_values = set(re.findall(r'hsl\([^)]+\)', css_content))

missing_from_css = ts_values - css_values
if missing_from_css:
    print("❌ tokens.ts has color values not found anywhere in globals.css @theme — these have drifted:")
    for v in sorted(missing_from_css):
        print(f"   {v}")
    sys.exit(1)
print("✅ tokens.ts colors all have a matching value in globals.css")
PY
  DRIFT_EXIT=$?
  set -e
  if [ "$DRIFT_EXIT" -ne 0 ]; then FAIL=1; fi
else
  echo "⏭  skipping drift check — tokens.ts or globals.css not found at expected path"
fi

echo ""
if [ "$FAIL" -eq 1 ]; then
  echo "Guardrail check FAILED. Fix the items above before committing."
  exit 1
else
  echo "All guardrail checks passed."
fi
