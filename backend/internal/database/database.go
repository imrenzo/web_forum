package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/imrenzo/web_forum/internal/jwtHandler"
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

// // Create Posts (checking that user in context from jwt middleware & user making post are the same person)and
// // need add ftn for creating Comments ////
func CreateThread(w http.ResponseWriter, r *http.Request) {
	var createThreadInfo models.CreateThread
	err := json.NewDecoder(r.Body).Decode(&createThreadInfo)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := jwtHandler.GetUserIDfromJWT(r)

	db := OpenDb()
	defer db.Close()

	_, err = db.Query(`
		INSERT INTO posts (op_id, post_title, post_info) VALUES ($1, $2, $3);`, userID, createThreadInfo.Title, createThreadInfo.ThreadInfo)

	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	//get post_id so that can load back into page
	var post_id int
	err = db.QueryRow("SELECT post_id FROM posts WHERE op_id = $1 AND post_title = $2 AND post_info = $3",
		userID, createThreadInfo.Title, createThreadInfo.ThreadInfo).Scan(&post_id)
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

func DeleteThread(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	post_idStr := chi.URLParam(r, "id")
	post_id, err := strconv.Atoi(post_idStr)
	if err != nil {
		panic(err)
	}

	userID := jwtHandler.GetUserIDfromJWT(r)

	// ensure user that original poster and userID making delete req matches
	var op_id int
	err = db.QueryRow("SELECT op_id FROM posts WHERE post_id = $1", post_id).Scan(&op_id)
	if err != nil {
		panic(err)
	}

	if op_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// deletes posts and comments associated with it as comments have foreign key constraint
	_, err = db.Query("DELETE FROM comments WHERE post_id = $1", post_id)
	if err != nil {
		panic(err)
	}

	_, err = db.Query("DELETE FROM posts WHERE post_id = $1", post_id)
	if err != nil {
		panic(err)
	}

	w.WriteHeader(http.StatusNoContent)
}

// ////////// Read Posts and Comments ////////////
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

func SinglePostAndComments(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	idStr := chi.URLParam(r, "id")
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

func CheckPostOwner(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	var postId int
	err := json.NewDecoder(r.Body).Decode(&postId)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := jwtHandler.GetUserIDfromJWT(r)
	println("userid: ", userID)
	println("postid: ", postId)
	var count int
	err = db.QueryRow(`SELECT COUNT(*)
						FROM users 
						INNER JOIN posts ON user_id = op_id
						WHERE user_id = $1 AND post_id = $2`, userID, postId).Scan(&count)
	if err != nil {
		panic(err)
	}
	println("count: ", count)
	if count != 1 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
