package users

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	_ "github.com/lib/pq" // registers the driver that OpenDb asks for (main.go does this in the real server)
)

// validation runs before any query, so no database is contacted
func TestSignUpRejectsBlankCredentials(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://u:p@127.0.0.1:1/none?sslmode=disable")
	for name, body := range map[string]string{
		"blank username": `{"username":"  ","password":"x"}`,
		"no password":    `{"username":"bob","password":""}`,
		"bad json":       `{`,
	} {
		rec := httptest.NewRecorder()
		SignUpUser(rec, httptest.NewRequest(http.MethodPost, "/user/signup", strings.NewReader(body)))
		if rec.Code != http.StatusBadRequest {
			t.Errorf("%s: got %d, want 400", name, rec.Code)
		}
	}
}
