package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	_ "github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "root"
	dbname   = "web_forum"
)

type Post struct {
	Post_title string `json:"post_title"`
	Post_id    int    `json:"post_id"`
	Op_id      int    `json:"op_id"`
	Post_info  string `json:"post_info"`
	Post_date  string `json:"post_date"`
}

const secretkey = "hello_world"

func main() {
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	port := ":8080"

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // react app port
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	router.Get("/", LoadPosts)
	router.Post("/login", CheckValidUser)
	if err := http.ListenAndServe(port, router); err != nil {
		panic(err)
	}
}

func OpenDb() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	return db
}

func CheckValidUser(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	var userData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

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
		key []byte
		token   *jwt.Token
		jwtStr   string
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

func LoadPosts(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	req := `SELECT post_title, post_id, op_id, post_info, post_date FROM posts`
	rows, err := db.Query(req)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var posts []Post

	for rows.Next() {
		var post Post
		err := rows.Scan(&post.Post_title, &post.Post_id, &post.Op_id, &post.Post_info, &post.Post_date)
		if err != nil {
			panic(err)
		}
		posts = append(posts, post)
	}
	// fmt.Println(posts)
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
