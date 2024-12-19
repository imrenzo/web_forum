package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/imrenzo/web_forum/internal/models"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "root"
	dbname   = "web_forum"
)

func OpenDb() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	return db
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

	var posts []models.Post

	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.Post_title, &post.Post_id, &post.Op_id, &post.Post_info, &post.Post_date)
		if err != nil {
			panic(err)
		}
		posts = append(posts, post)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
