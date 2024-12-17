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
	Post_id   int    `json:"post_id"`
	Op_id     int    `json:"op_id"`
	Post_info string `json:"post_info"`
	Post_date string `json:"post_date"`
}

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
	if err := http.ListenAndServe(port, router); err != nil {
		panic(err)
	}
}

func LoadPosts(w http.ResponseWriter, r *http.Request) {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	req := `SELECT post_id, op_id, post_info, post_date FROM posts`
	rows, err := db.Query(req)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var posts []Post

	for rows.Next() {
		var post Post
		err := rows.Scan(&post.Post_id, &post.Op_id, &post.Post_info, &post.Post_date)
		if err != nil {
			panic(err)
		}
		posts = append(posts, post)
	}
	fmt.Println(posts)
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
