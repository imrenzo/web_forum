package authentication

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/imrenzo/web_forum/internal/shared"
)

const secretkey = "hello_world"

const userIDkey contextKey = "userID"

type contextKey string

type MyCustomClaims struct {
	Username string `json:"username"`
	UserID   int    `json:"userID"`
	jwt.RegisteredClaims
}

func CreateJwtToken(username string, userID int) string {
	key := []byte(secretkey)
	// token validity duration
	expirationTime := time.Now().Add(time.Hour)

	claims := MyCustomClaims{
		username,
		userID,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Issuer:    "web-forum",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	jwtString, err := token.SignedString(key)
	if err != nil {
		panic(err)
	}
	return jwtString
}

func VerifyToken(tokenStr string) (*MyCustomClaims, error) {
	key := []byte(secretkey)

	token, err := jwt.ParseWithClaims(tokenStr, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return key, nil
	})

	if err != nil {
		fmt.Println("Error parsing token:", err)
		return nil, err
	}
	claims, ok := token.Claims.(*MyCustomClaims)
	if !ok {
		return nil, fmt.Errorf("failed to parse token claims")
	}
	if token.Valid {
		if claims.Issuer != "web-forum" {
			return nil, fmt.Errorf("invalid token")
		}
		if claims.ExpiresAt.Time.Before(time.Now()) {
			return nil, fmt.Errorf("token is expired")
		}
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// for crud processes that requires token authentication
func TokenVerifyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header is missing", http.StatusUnauthorized)
			return
		}

		// Check if the header is in the correct "Bearer <token>" format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}
		tokenStr := tokenParts[1]
		claims, err := VerifyToken(tokenStr)

		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		id := claims.UserID

		if id > 0 {
			exists, errormsg := shared.UserIDExists(id)
			if !exists {
				log.Println(errormsg)
				return
			}
			println("authenticated by middleware!")
			ctx := context.WithValue(r.Context(), userIDkey, id)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			log.Println("Empty id!")
			http.Error(w, "Invalid User ID", http.StatusUnauthorized)
			return
		}
	})
}

// check that token is valid for header bar
func DirectAuthenticate(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header is missing", http.StatusUnauthorized)
		return
	}

	// Check if the header is in the correct "Bearer <token>" format
	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
		return
	}

	tokenStr := tokenParts[1]

	claims, err := VerifyToken(tokenStr)

	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("UserID: , %d", claims.UserID)))
}

func GetUserIDfromJWT(r *http.Request) int {
	jwtUserID := r.Context().Value(userIDkey).(int)
	println("userID: ", jwtUserID)
	return jwtUserID
}
