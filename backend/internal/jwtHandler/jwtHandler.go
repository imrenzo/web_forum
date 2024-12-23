package jwtHandler

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/imrenzo/web_forum/internal/database"
)

const secretkey = "hello_world"

const usernameKey contextKey = "username"

type contextKey string

type MyCustomClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func CreateJwtToken(username string) string {
	key := []byte(secretkey)
	// token validity duration
	expirationTime := time.Now().Add(time.Minute / 6)

	claims := MyCustomClaims{
		username,
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

		username := claims.Username
		if username != "" {
			exists, err := database.UsernameExists(username)
			if !exists {
				log.Println(err)
				return
			}
			ctx := context.WithValue(r.Context(), usernameKey, username)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			log.Println("Audience is empty, unable to extract username")
			return
		}
	})
}

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
		// if strings.Contains(err.Error(), "token is expired") {
		// 	println("token is expired")
		// 	http.ResponseWriter(http.StatusLocked)
		// 	return
		// }
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	username := claims.Username
	if username != "" {
		exists, err := database.UsernameExists(username)
		if !exists {
			log.Println(err)
			return
		}
		w.WriteHeader(http.StatusOK)
		return
	} else {
		log.Println("Audience is empty, unable to extract username")
		http.Error(w, "Unknown error occurred", http.StatusUnauthorized)
		return
	}
}

// get username of the token
// need to check with REQUESTER USERNAME
// username := r.Context().Value(usernameKey).(string)
