package authentication

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestTokenRoundTrip(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret")
	claims, err := VerifyToken(CreateJwtToken("alice", 7))
	if err != nil {
		t.Fatal(err)
	}
	if claims.UserID != 7 || claims.Username != "alice" {
		t.Fatalf("unexpected claims: %+v", claims)
	}
}

func TestVerifyTokenRejects(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret")
	sign := func(secret string, c MyCustomClaims) string {
		s, err := jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString([]byte(secret))
		if err != nil {
			t.Fatal(err)
		}
		return s
	}
	future := jwt.NewNumericDate(time.Now().Add(time.Hour))
	cases := map[string]string{
		"wrong secret": sign("other", MyCustomClaims{UserID: 1, RegisteredClaims: jwt.RegisteredClaims{Issuer: "web-forum", ExpiresAt: future}}),
		"expired":      sign("test-secret", MyCustomClaims{UserID: 1, RegisteredClaims: jwt.RegisteredClaims{Issuer: "web-forum", ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Minute))}}),
		"wrong issuer": sign("test-secret", MyCustomClaims{UserID: 1, RegisteredClaims: jwt.RegisteredClaims{Issuer: "someone-else", ExpiresAt: future}}),
		"garbage":      "not-a-token",
	}
	for name, tok := range cases {
		if _, err := VerifyToken(tok); err == nil {
			t.Errorf("%s: token was accepted", name)
		}
	}
}

func TestMiddlewareRejectsBadHeaders(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret")
	h := TokenVerifyMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("handler must not run")
	}))
	for name, header := range map[string]string{"missing": "", "no Bearer": "abc", "bad token": "Bearer abc"} {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		if header != "" {
			req.Header.Set("Authorization", header)
		}
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Errorf("%s: got %d, want 401", name, rec.Code)
		}
	}
}

func TestSecretRequired(t *testing.T) {
	t.Setenv("JWT_SECRET", "")
	defer func() {
		if recover() == nil {
			t.Error("expected panic when JWT_SECRET is unset")
		}
	}()
	GetSecretKey()
}
