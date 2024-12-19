package users

import (
	"encoding/json"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/models"
)

const secretkey = "hello_world"

func LogInUser(w http.ResponseWriter, r *http.Request) {
	db := database.OpenDb()
	defer db.Close()
	var userData models.UserData
	err := json.NewDecoder(r.Body).Decode(&userData)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// check if user login credentials matches db records
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1 AND password = $2", userData.Username, userData.Password).Scan(&count)
	if err != nil {
		panic(err)
	}
	if count != 1 {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"message": "Unauthorised"})
		return
	}

	// hadling creation and sending of jwt token symmetric HS256
	var (
		key    []byte
		token  *jwt.Token
		jwtStr string
	)

	key = []byte(secretkey)
	token = jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"username": userData.Username,
		})
	jwtStr, err = token.SignedString(key)
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Authorised", "token": jwtStr})
}

func CheckValidToken() {

}
