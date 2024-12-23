package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/imrenzo/web_forum/internal/models"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "root"
	dbname   = "web_forum"
)

const id = 1 //for testing without jwt

func OpenDb() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	return db
}

// ////////// Creation of Posts and Comments ////////////
func CreateThread(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	var createThreadInfo models.CreateThread
	err := json.NewDecoder(r.Body).Decode(&createThreadInfo)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err = db.Query(`
		INSERT INTO posts (op_id, post_title, post_info) VALUES ($1, $2, $3);`, createThreadInfo.Op_id, createThreadInfo.Title, createThreadInfo.ThreadInfo)
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	var post_id int
	err = db.QueryRow("SELECT post_id FROM posts WHERE op_id = $1 ORDER BY post_date DESC LIMIT 1;", id).Scan(&post_id)
	if err != nil {
		panic(err)
	}
	if post_id <= 0 {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post_id)
}

// ////////// Read Posts and Comments ////////////
// load all posts
func LoadPosts(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	req := `SELECT username,post_id, user_id, post_title, post_info, post_date
			FROM users 
			INNER JOIN posts ON user_id = op_id
			ORDER BY post_date DESC`
	postRows, err := db.Query(req)
	if err != nil {
		panic(err)
	}
	defer postRows.Close()

	var posts []models.Post

	for postRows.Next() {
		var post models.Post
		err := postRows.Scan(&post.Username, &post.Post_id, &post.Op_id, &post.Post_title, &post.Post_info, &post.Post_date)
		if err != nil {
			panic(err)
		}
		posts = append(posts, post)
	}
	err = postRows.Err()
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// load single post
func SinglePostAndComments(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	idStr := chi.URLParam(r, "num")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		panic(err)
	}

	var post models.Post
	err = db.QueryRow(`
		SELECT username,post_id, user_id, post_title, post_info, post_date
		FROM users INNER JOIN posts ON user_id = op_id
		WHERE post_id = $1`, id).
		Scan(&post.Username, &post.Post_id, &post.Op_id, &post.Post_title, &post.Post_info, &post.Post_date)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "Post query does not exist"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	commentRows, err := db.Query(`
		SELECT username, comment_id, commenter_id, comment_info, comment_date
		FROM users INNER JOIN comments ON user_id = commenter_id
		WHERE post_id = $1
		ORDER BY comment_date DESC`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "Post query does not exist"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer commentRows.Close()

	var comments []models.Comments

	for commentRows.Next() {
		var comment models.Comments
		err = commentRows.Scan(&comment.Username, &comment.Comment_id, &comment.Commenter_id, &comment.Comment_info, &comment.Comment_date)
		if err != nil {
			panic(err)
		}
		comments = append(comments, comment)
	}
	err = commentRows.Err()
	if err != nil {
		panic(err)
	}

	result := models.PostWithComments{
		Post:     post,
		Comments: comments,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func UsernameExists(username string) (bool, string) {
	db := OpenDb()
	defer db.Close()

	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE username = $1`, username).Scan(&count)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		return false, "User does not exist"
	} else if count > 1 {
		return false, "Internal Server Error"
	} else {
		return true, ""
	}
}
