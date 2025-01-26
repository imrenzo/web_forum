package users

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"

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

	// check if username exists db records (as username is unique)
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1",
		userData.Username).Scan(&count)
	if err != nil {
		http.Error(w, "error checking if username exists in database", http.StatusInternalServerError)
		return
	}
	if count != 1 {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"message": "Unauthorised"})
		return
	}
	// get hashed password from database
	var hashedPassword []byte
	err = db.QueryRow("SELECT password FROM users WHERE username = $1",
		userData.Username).Scan(&hashedPassword)
	if err != nil {
		http.Error(w, "error getting hashed password", http.StatusInternalServerError)
		return
	}

	// check if password entered by user matches hashed password in database
	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(userData.Password))
	if err != nil {
		http.Error(w, "error comparing hashed password", http.StatusUnauthorized)
		return
	}

	// return user with jwtToken
	userData.User_ID = GetUserID(userData.Username)
	jwtString := authentication.CreateJwtToken(userData.Username, userData.User_ID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Authorised", "token": jwtString})
}

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	db := database.OpenDb()
	defer db.Close()
	var passwords models.ChangePassword
	err := json.NewDecoder(r.Body).Decode(&passwords)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	oldPassword := passwords.PrevPassword
	newPassword := passwords.NewPassword
	userID := authentication.GetUserIDfromJWT(r)

	// get hashed password from database
	var hashedPassword []byte
	var username string
	err = db.QueryRow("SELECT password, username FROM users WHERE user_id = $1",
		userID).Scan(&hashedPassword, &username)
	if err != nil {
		http.Error(w, "error getting hashed password/ username", http.StatusInternalServerError)
		return
	}

	// check if password entered by user matches hashed password in database
	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(oldPassword))
	if err != nil {
		http.Error(w, "Old password is wrong", http.StatusUnauthorized)
		return
	}

	// hashing new password
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "error hashing password", http.StatusInternalServerError)
		return
	}

	//update passsword in db
	_, err = db.Exec(`UPDATE users SET password = $1 WHERE user_id = $2`, newHashedPassword, userID)
	if err != nil {
		http.Error(w, "error updating new password", http.StatusInternalServerError)
		return
	}

	// return user with new jwtToken
	jwtString := authentication.CreateJwtToken(username, userID)
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

	// check username that is to be registered is not in db records (i.e. username is unique)
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", userData.Username).Scan(&count)
	if err != nil {
		http.Error(w, "error checking duplicate username", http.StatusInternalServerError)
		return
	}

	if count > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"message": "username already exists"})
		return
	}

	// hashing password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "error hasing password", http.StatusInternalServerError)
		return
	}

	// insert username and hashed password into db & logs user in
	_, err = db.Query("INSERT INTO users (username, password) VALUES ($1, $2);", userData.Username, hashedPassword)
	if err != nil {
		http.Error(w, "error inserting user cred during signup", http.StatusInternalServerError)
		return
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
