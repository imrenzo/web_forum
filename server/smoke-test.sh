# Smoke test against a running server (default http://localhost:8080). Creates two random users and some threads.
# Usage: bash server/smoke-test.sh [base-url]
B=${1:-http://localhost:8080}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
J='Content-Type: application/json'
tok() { sed -E 's/.*"token":"([^"]+)".*/\1/'; }
chk() { printf '%-58s want %-3s got %s\n' "$1" "$2" "$3"; [ "$2" = "$3" ] || FAIL=1; }
U=$RANDOM
A=$(curl -s -X POST $B/user/signup -H "$J" -d "{\"username\":\"alice$U\",\"password\":\"pw1\"}" | tok)
Bt=$(curl -s -X POST $B/user/signup -H "$J" -d "{\"username\":\"bob$U\",\"password\":\"pw2\"}" | tok)
[ -n "$A" ] && [ -n "$Bt" ] && echo "signup alice/bob: tokens received"
chk "signup empty username" 400 $(code -X POST $B/user/signup -H "$J" -d '{"username":"  ","password":"x"}')
chk "signup empty password" 400 $(code -X POST $B/user/signup -H "$J" -d '{"username":"zed","password":""}')
chk "signup duplicate username" 409 $(code -X POST $B/user/signup -H "$J" -d "{\"username\":\"alice$U\",\"password\":\"pw1\"}")
chk "login ok" 200 $(code -X POST $B/user/login -H "$J" -d "{\"username\":\"alice$U\",\"password\":\"pw1\"}")
chk "login wrong password" 401 $(code -X POST $B/user/login -H "$J" -d "{\"username\":\"alice$U\",\"password\":\"nope\"}")
AH="Authorization: Bearer $A"; BH="Authorization: Bearer $Bt"
chk "create thread, no token" 401 $(code -X POST $B/thread -H "$J" -d '{}')
chk "create thread, garbage token" 401 $(code -X POST $B/thread -H "$J" -H "Authorization: Bearer abc" -d '{}')
chk "create thread, blank title" 400 $(code -X POST $B/thread -H "$J" -H "$AH" -d '{"createThread":{"title":" ","content":"c"},"category":"Science"}')
chk "create thread, unknown category" 400 $(code -X POST $B/thread -H "$J" -H "$AH" -d '{"createThread":{"title":"t","content":"c"},"category":"Nope"}')
T1=$(curl -s -X POST $B/thread -H "$J" -H "$AH" -d '{"createThread":{"title":"Same","content":"same body"},"category":"Science"}')
T2=$(curl -s -X POST $B/thread -H "$J" -H "$AH" -d '{"createThread":{"title":"Same","content":"same body"},"category":"Science"}')
echo "identical threads got ids $T1 and $T2"; [ "$T1" != "$T2" ] || FAIL=1
chk "create comment (bob) on thread $T1" 202 $(code -X POST $B/comment/$T1 -H "$J" -H "$BH" -d '"hello from bob"')
chk "create comment, blank" 400 $(code -X POST $B/comment/$T1 -H "$J" -H "$BH" -d '"  "')
chk "get thread with comments" 200 $(code $B/thread/$T1)
CID=$(curl -s $B/thread/$T1 | sed -E 's/.*"comment_id":([0-9]+).*/\1/')
echo "comment id $CID"
chk "list threads" 200 $(code $B/)
chk "my threads (alice)" 200 $(code -H "$AH" $B/mythreads)
echo "--- authorization"
chk "bob UPDATE alice's thread" 403 $(code -X PUT $B/thread/$T1 -H "$J" -H "$BH" -d '{"title":"x","content":"y"}')
chk "bob DELETE alice's thread" 403 $(code -X DELETE $B/thread/$T1 -H "$BH")
chk "alice UPDATE bob's comment" 403 $(code -X PUT $B/comment/$CID -H "$J" -H "$AH" -d '"hijack"')
chk "alice DELETE bob's comment" 403 $(code -X DELETE $B/comment/$CID -H "$AH")
chk "bob checkthreadowner on alice's thread" 403 $(code -X POST $B/checkthreadowner -H "$J" -H "$BH" -d "$T1")
chk "alice checkthreadowner on her thread" 204 $(code -X POST $B/checkthreadowner -H "$J" -H "$AH" -d "$T1")
chk "UPDATE thread no token" 401 $(code -X PUT $B/thread/$T1 -H "$J" -d '{"title":"x","content":"y"}')
chk "DELETE thread no token" 401 $(code -X DELETE $B/thread/$T1)
echo "--- owner actions + edge cases"
chk "alice UPDATE own thread" 204 $(code -X PUT $B/thread/$T1 -H "$J" -H "$AH" -d '{"title":"edited","content":"edited body"}')
chk "alice UPDATE own thread, blank" 400 $(code -X PUT $B/thread/$T1 -H "$J" -H "$AH" -d '{"title":"","content":"y"}')
chk "bob UPDATE own comment" 204 $(code -X PUT $B/comment/$CID -H "$J" -H "$BH" -d '"edited by bob"')
chk "DELETE thread with non-numeric id" 400 $(code -X DELETE $B/thread/abc -H "$AH")
chk "DELETE nonexistent thread" 404 $(code -X DELETE $B/thread/999999 -H "$AH")
chk "UPDATE nonexistent comment" 404 $(code -X PUT $B/comment/999999 -H "$J" -H "$AH" -d '"x"')
chk "GET nonexistent thread" 404 $(code $B/thread/999999)
chk "GET thread non-numeric id" 400 $(code $B/thread/abc)
chk "bob DELETE own comment" 204 $(code -X DELETE $B/comment/$CID -H "$BH")
chk "alice DELETE own thread $T1" 204 $(code -X DELETE $B/thread/$T1 -H "$AH")
chk "GET deleted thread" 404 $(code $B/thread/$T1)
chk "alice DELETE thread $T2 (has no comments)" 204 $(code -X DELETE $B/thread/$T2 -H "$AH")
echo "--- password change + CORS"
chk "change password, wrong old" 401 $(code -X POST $B/user/change_password -H "$J" -H "$AH" -d '{"prevPassword":"bad","newPassword":"n"}')
NT=$(curl -s -X POST $B/user/change_password -H "$J" -H "$AH" -d '{"prevPassword":"pw1","newPassword":"pw1b"}'); echo "$NT" | grep -q token && echo "change password: new token issued"
chk "login with new password" 200 $(code -X POST $B/user/login -H "$J" -d "{\"username\":\"alice$U\",\"password\":\"pw1b\"}")
pre() { curl -s -i -X OPTIONS $B/thread -H "Origin: $1" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: authorization,content-type" | grep -ci "^access-control-allow-origin: $1"; }
chk "CORS preflight allows http://localhost:3000 (1 = allowed)" 1 $(pre http://localhost:3000)
chk "CORS preflight refuses http://evil.example (0 = refused)" 0 $(pre http://evil.example)
if [ -z "$FAIL" ]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
