package users

import (
	"encoding/json"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/models"
)

const secretkey = "hello_world"

func createJwtToken(username string) string {
	var (
		key       []byte
		token     *jwt.Token
		jwtString string
	)
	key = []byte(secretkey)
	token = jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"username": username,
		})

	jwtString, err := token.SignedString(key)
	if err != nil {
		panic(err)
	}

	return jwtString
}

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

	jwtString := createJwtToken(userData.Username)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Authorised", "token": jwtString})
}

func SignUpUser(w http.ResponseWriter, r *http.Request) {
	db := database.OpenDb()
	defer db.Close()
	var userData models.UserData
	err := json.NewDecoder(r.Body).Decode(&userData)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// check username that is to be registered is not in db records
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", userData.Username).Scan(&count)
	if err != nil {
		panic(err)
	}

	if count > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"message": "username already exists"})
		return
	}

	// insert userData into db & logs user in
	_, err = db.Query("INSERT INTO users (username, password) VALUES ($1, $2);", userData.Username, userData.Password)
	if err != nil {
		panic(err)
	}

	jwtString := createJwtToken(userData.Username)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "sucessfully registered", "token": jwtString})
}

func CheckValidToken() {

}
