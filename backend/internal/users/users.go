package users

import (
	"encoding/json"
	"net/http"

	"github.com/imrenzo/web_forum/internal/authentication"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/models"
)

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

	userData.User_ID = GetUserID(userData.Username)

	jwtString := authentication.CreateJwtToken(userData.Username, userData.User_ID)
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

	userData.User_ID = GetUserID(userData.Username)

	jwtString := authentication.CreateJwtToken(userData.Username, userData.User_ID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "sucessfully registered", "token": jwtString})
}

func GetUserID(username string) int {
	db := database.OpenDb()
	defer db.Close()
	var id int
	err := db.QueryRow("SELECT user_id FROM users WHERE username = $1", username).Scan(&id)
	if err != nil {
		panic(err)
	}
	return id
}
