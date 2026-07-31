#!/bin/sh
# Production FinOps — read-only usage/billing data collection helpers
# All queries are read-only. Never accept flags that could mutate resources.
set -eu

usage() {
  cat <<'EOF'
Usage: sh scripts/collect-usage.sh <provider> [subcommand]

Providers:
  vercel   — Collect Vercel team/project usage data
  neon     — Collect Neon project usage data (scoped API key)
  upstash  — Collect Upstash Redis database usage data

Examples:
  sh scripts/collect-usage.sh vercel team        # Team info + billing plan
  sh scripts/collect-usage.sh vercel projects    # Project list
  sh scripts/collect-usage.sh vercel usage       # Usage data (tries 3 API approaches)
  sh scripts/collect-usage.sh neon project       # Project info + usage
  sh scripts/collect-usage.sh neon branches      # Branch list
  sh scripts/collect-usage.sh upstash list       # List Redis databases
  sh scripts/collect-usage.sh upstash stats      # Daily stats from known DB
EOF
  exit 0
}

[ $# -lt 1 ] && usage

PROVIDER="$1"
SUBCOMMAND="${2:-}"

case "$PROVIDER" in
  vercel)
    TEAM_SLUG="matangubs-projects"
    case "$SUBCOMMAND" in
      team)
        echo "=== Vercel Team Info ==="
        curl -s --fail -H "Authorization: Bearer $VERCEL_TOKEN" \
          "https://api.vercel.com/v1/teams/${TEAM_SLUG}" | \
          python3 -c "
import sys, json
d = json.load(sys.stdin)
info = {k: d.get(k) for k in ['slug','name','plan','billing','resourceConfig'] if k in d}
if 'billing' in info:
    b = info['billing']
    print(f\"Plan: {b.get('plan','?')} / {b.get('planIteration','?')}\")
    print(f\"Status: {b.get('status','?')}\")
    print(f\"Currency: {b.get('currency','?')}\")
    print(f\"Period: {b.get('period','?')}\")
    print(f\"Trial: {b.get('trial','?')}\")
if 'resourceConfig' in info:
    rc = info['resourceConfig']
    print(f\"Concurrent builds: {rc.get('concurrentBuilds','?')}\")
    print(f\"Build machine: {rc.get('buildMachine','?')}\")
"
        ;;
      projects)
        echo "=== Vercel Projects ==="
        vercel project list --token "$VERCEL_TOKEN" --scope "$TEAM_SLUG" 2>&1
        ;;
      deployments)
        echo "=== Vercel Recent Deployments ==="
        curl -s --fail -H "Authorization: Bearer $VERCEL_TOKEN" \
          "https://api.vercel.com/v1/deployments?teamId=${TEAM_SLUG}&limit=10" | \
          python3 -c "
import sys, json
d = json.load(sys.stdin)
for dep in d.get('deployments', []):
    print(f\"{dep.get('name','?')} | {dep.get('state','?')} | url: {dep.get('url','?')}\")
"
        ;;
      usage)
        echo "=== Vercel Usage Data ==="
        echo "Info: Vercel usage API is known to return empty responses for some team configs."
        echo "Trying multiple endpoints..."
        echo ""
        # Approach 1: v1/teams/{slug}/usage with epoch timestamps (last 30 days)
        echo "--- v1/teams/{slug}/usage (last 30 days) ---"
        _now_epoch=$(python3 -c "import time; print(int(time.time() * 1000))")
        _thirty_days_ago=$(python3 -c "import time; print(int((time.time() - 30*86400) * 1000))")
        _v1_result=$(curl -s --fail -H "Authorization: Bearer $VERCEL_TOKEN" \
          "https://api.vercel.com/v1/teams/${TEAM_SLUG}/usage?from=${_thirty_days_ago}&to=${_now_epoch}" 2>&1)
        if [ -n "$_v1_result" ] && [ "$_v1_result" != "[]" ] && [ "$_v1_result" != "{}" ]; then
          echo "$_v1_result" | python3 -m json.tool 2>/dev/null || echo "$_v1_result"
        else
          echo "(empty response)"
        fi
        echo ""
        # Approach 2: v2/usage with type=requests (current billing period)
        echo "--- v2/usage?type=requests ---"
        _v2_req=$(curl -s --fail -H "Authorization: Bearer $VERCEL_TOKEN" \
          "https://api.vercel.com/v2/usage?teamId=${TEAM_SLUG}&type=requests" 2>&1)
        if [ -n "$_v2_req" ] && [ "$_v2_req" != "[]" ] && [ "$_v2_req" != "{}" ]; then
          echo "$_v2_req" | python3 -m json.tool 2>/dev/null || echo "$_v2_req"
        else
          echo "(empty response)"
        fi
        echo ""
        # Approach 3: v2/usage with type=build-minutes
        echo "--- v2/usage?type=build-minutes ---"
        _v2_build=$(curl -s --fail -H "Authorization: Bearer $VERCEL_TOKEN" \
          "https://api.vercel.com/v2/usage?teamId=${TEAM_SLUG}&type=build-minutes" 2>&1)
        if [ -n "$_v2_build" ] && [ "$_v2_build" != "[]" ] && [ "$_v2_build" != "{}" ]; then
          echo "$_v2_build" | python3 -m json.tool 2>/dev/null || echo "$_v2_build"
        else
          echo "(empty response)"
        fi
        echo ""
        echo "--- Summary ---"
        echo "If all endpoints returned empty, usage data is unavailable via API."
        echo "An operator should check the Vercel dashboard manually."
        ;;
      *)
        echo "Vercel subcommands: team, projects, deployments, usage"
        exit 1
        ;;
    esac
    ;;

  neon)
    case "$SUBCOMMAND" in
      project)
        echo "=== Neon Project Info ==="
        curl -s --fail -H "Authorization: Bearer $NEON_API_KEY" \
          "https://console.neon.tech/api/v2/projects/aged-cell-56570215" | \
          python3 -c "
import sys, json
d = json.load(sys.stdin).get('project', {})
for k in ['id','name','pg_version','region_id','platform_id','provisioner']:
    print(f\"{k}: {d.get(k,'?')}\")
print(f\"CPU used (sec): {d.get('compute_time_seconds','?')}\")
print(f\"Active time (sec): {d.get('active_time_seconds','?')}\")
print(f\"Data transfer (bytes): {d.get('data_transfer_bytes','?')}\")
print(f\"Synthetic storage (bytes): {d.get('synthetic_storage_size','?')}\")
print(f\"Suspend timeout: {d.get('default_endpoint_settings',{}).get('suspend_timeout_seconds','?')}\")
print(f\"Autoscaling CU: {d.get('default_endpoint_settings',{}).get('autoscaling_limit_min_cu','?')} - {d.get('default_endpoint_settings',{}).get('autoscaling_limit_max_cu','?')}\")
print(f\"Plan: {d.get('owner',{}).get('subscription_type','?')}\")
print(f\"Consumption period: {d.get('consumption_period_start','?')} to {d.get('consumption_period_end','?')}\")
"
        ;;
      branches)
        echo "=== Neon Branches ==="
        neonctl branches list --project-id aged-cell-56570215 2>&1
        ;;
      *)
        echo "Neon subcommands: project, branches"
        exit 1
        ;;
    esac
    ;;

  upstash)
    # project10 database ID is stable
    DB_ID="b80dff0d-1e89-406a-975c-55a3fed46e3b"

    case "$SUBCOMMAND" in
      list)
        echo "=== Upstash Redis Databases ==="
        upstash redis list --email "$UPSTASH_EMAIL" --api-key "$UPSTASH_TOKEN" 2>&1 | \
          python3 -c "
import sys, json
for db in json.load(sys.stdin):
    name = db.get('database_name','?')
    dtype = db.get('database_type','?')
    size = db.get('db_resource_size','?')
    region = db.get('primary_region','?')
    state = db.get('state','?')
    print(f\"{name} | type={dtype} | size={size} | region={region} | state={state}\")
"
        ;;
      stats)
        echo "=== Upstash Redis Stats (project10) ==="
        # Write data to temp file to avoid pipe/heredoc conflicts
        _upstash_tmp=$(mktemp)
        upstash redis stats --db-id "$DB_ID" --email "$UPSTASH_EMAIL" --api-key "$UPSTASH_TOKEN" > "$_upstash_tmp" 2>&1
        python3 -c "
import sys, json
d = json.load(open(sys.argv[1]))
print(f'Daily net commands: {d.get(\"daily_net_commands\",\"?\")}')
print(f'Daily reads: {d.get(\"daily_read_requests\",\"?\")}')
print(f'Daily writes: {d.get(\"daily_write_requests\",\"?\")}')
print(f'Total monthly requests: {d.get(\"total_monthly_requests\",\"?\")}')
print(f'Total monthly reads: {d.get(\"total_monthly_read_requests\",\"?\")}')
print(f'Total monthly writes: {d.get(\"total_monthly_write_requests\",\"?\")}')
print(f'Current storage (bytes): {d.get(\"current_storage\",\"?\")}')
print(f'Current keys: {max(k[\"y\"] for k in d.get(\"keyspace\",[{\"y\":0}]))}')
print(f'Total monthly bandwidth (bytes): {d.get(\"total_monthly_bandwidth\",\"?\")}')
print(f'Monthly billing: {d.get(\"total_monthly_billing\",\"?\")} USD')
print()
print('Daily requests trend:')
for day in d.get('dailyrequests', []):
    print(f'  {day.get(\"x\",\"?\")[:10]}: {day.get(\"y\",\"?\")} requests')
print()
print('Daily bandwidth trend:')
for bw in d.get('bandwidths', []):
    print(f'  {bw.get(\"x\",\"?\")[:10]}: {bw.get(\"y\",\"?\")} bytes')
\" \"$_upstash_tmp\"
        rm "$_upstash_tmp"
        ;;
      *)
        echo "Upstash subcommands: list, stats"
        exit 1
        ;;
    esac
    ;;

  *)
    echo "Unknown provider: $PROVIDER"
    echo "Supported: vercel, neon, upstash"
    exit 1
    ;;
esac
