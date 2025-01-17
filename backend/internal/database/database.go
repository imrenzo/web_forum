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

func URLGetThreadID(r *http.Request) int {
	thread_idStr := chi.URLParam(r, "id")
	thread_id, err := strconv.Atoi(thread_idStr)
	if err != nil {
		panic(err)
	}
	return thread_id
}

func URLGetCommentID(r *http.Request) int {
	comment_idStr := chi.URLParam(r, "commentID")
	comment_id, err := strconv.Atoi(comment_idStr)
	if err != nil {
		panic(err)
	}
	return comment_id
}

func GetCategoryID(category string) int {
	db := OpenDb()
	defer db.Close()

	var categoryID int
	err := db.QueryRow(`SELECT category_id FROM categories WHERE category_name = $1`, category).Scan(&categoryID)
	if err != nil {
		panic(err)
	}
	return categoryID
}

// ** For Threads: **
func CreateThread(w http.ResponseWriter, r *http.Request) {
	var createThreadWithCategory models.CreateThreadWithCategory
	err := json.NewDecoder(r.Body).Decode(&createThreadWithCategory)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := jwtHandler.GetUserIDfromJWT(r)
	createThreadInfo := createThreadWithCategory.CreateThread
	category := createThreadWithCategory.Category

	categoryID := GetCategoryID(category)

	db := OpenDb()
	defer db.Close()

	_, err = db.Exec(`
		INSERT INTO threads (op_id, thread_title, thread_info, category_id) VALUES ($1, $2, $3, $4);`, userID, createThreadInfo.Title, createThreadInfo.ThreadInfo, categoryID)
	if err != nil {
		http.Error(w, "unable to insert into threads", http.StatusInternalServerError)
		return
	}
	println("here1")

	//get thread_id so that can load back into page
	var thread_id int
	err = db.QueryRow("SELECT thread_id FROM threads WHERE op_id = $1 AND thread_title = $2 AND thread_info = $3",
		userID, createThreadInfo.Title, createThreadInfo.ThreadInfo).Scan(&thread_id)
	if err != nil {
		http.Error(w, "unable to obtain id from newly created thread", http.StatusInternalServerError)
		return
	}

	if thread_id <= 0 {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(thread_id)
}

func UpdateThread(w http.ResponseWriter, r *http.Request) {
	var createThreadInfo models.CreateThread
	err := json.NewDecoder(r.Body).Decode(&createThreadInfo)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	db := OpenDb()
	defer db.Close()

	thread_id := URLGetThreadID(r)
	userID := jwtHandler.GetUserIDfromJWT(r)

	// ensure user that original poster and userID making update req matches
	var op_id int
	err = db.QueryRow("SELECT op_id FROM threads WHERE thread_id = $1", thread_id).Scan(&op_id)
	if err != nil {
		http.Error(w, "UpdateThread: unable to get op_id", http.StatusInternalServerError)
		return
	}

	if op_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// update thread
	_, err = db.Exec("UPDATE threads SET thread_title = $1, thread_info = $2, thread_date = CURRENT_TIMESTAMP WHERE thread_id = $3;", createThreadInfo.Title, createThreadInfo.ThreadInfo, thread_id)
	if err != nil {
		http.Error(w, "unable to update thread", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func DeleteThread(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	thread_id := URLGetThreadID(r)
	userID := jwtHandler.GetUserIDfromJWT(r)

	// ensure user that original poster and userID making delete req matches
	var op_id int
	err := db.QueryRow("SELECT op_id FROM threads WHERE thread_id = $1", thread_id).Scan(&op_id)
	if err != nil {
		http.Error(w, "DeleteThread: unable to obtain op_id", http.StatusInternalServerError)
		return
	}

	if op_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// deletes threads and comments associated with it as comments have foreign key constraint
	_, err = db.Exec("DELETE FROM comments WHERE thread_id = $1", thread_id)
	if err != nil {
		http.Error(w, "DeleteThread: unable to delete comments", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("DELETE FROM threads WHERE thread_id = $1", thread_id)
	if err != nil {
		http.Error(w, "DeleteThread: unable to delete thread", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Below 4 func reads threads
func AllThreads(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	req := `SELECT username,thread_id, user_id, thread_title, thread_info, thread_date
			FROM users 
			INNER JOIN threads ON user_id = op_id
			ORDER BY thread_date DESC`
	threadRows, err := db.Query(req)
	if err != nil {
		http.Error(w, "AllThreads: db req failed", http.StatusInternalServerError)
		return
	}
	defer threadRows.Close()

	var threads []models.GetThread

	for threadRows.Next() {
		var thread models.GetThread
		err := threadRows.Scan(&thread.Username, &thread.Thread_id, &thread.Op_id, &thread.Thread_title, &thread.Thread_info, &thread.Thread_date)
		if err != nil {
			http.Error(w, "error during threadRows scan", http.StatusInternalServerError)
			return
		}
		threads = append(threads, thread)
	}
	err = threadRows.Err()
	if err != nil {
		http.Error(w, "error during threadRows iteration", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threads)
}

func SingleThreadAndComments(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	thread_id := URLGetThreadID(r)

	var thread models.GetThread
	err := db.QueryRow(`
		SELECT username,thread_id, user_id, thread_title, thread_info, thread_date
		FROM users INNER JOIN threads ON user_id = op_id
		WHERE thread_id = $1`, thread_id).
		Scan(&thread.Username, &thread.Thread_id, &thread.Op_id, &thread.Thread_title, &thread.Thread_info, &thread.Thread_date)
	if err != nil {
		http.Error(w, "SingleThreadAndComments: db query for thread failed", http.StatusInternalServerError)
		return
	}

	commentRows, err := db.Query(`
		SELECT username, comment_id, commenter_id, comment_info, comment_date
		FROM users INNER JOIN comments ON user_id = commenter_id
		WHERE thread_id = $1
		ORDER BY comment_date DESC`, thread_id)
	if err != nil {
		http.Error(w, "SingleThreadAndComments: db query for comments failed", http.StatusInternalServerError)
		return
	}
	defer commentRows.Close()

	var comments []models.Comments

	for commentRows.Next() {
		var comment models.Comments
		err = commentRows.Scan(&comment.Username, &comment.Comment_id, &comment.Commenter_id, &comment.Comment_info, &comment.Comment_date)
		if err != nil {
			http.Error(w, "error during commentRows scan", http.StatusInternalServerError)
			return
		}
		comments = append(comments, comment)
	}
	err = commentRows.Err()
	if err != nil {
		http.Error(w, "error during commentRows iteration", http.StatusInternalServerError)
		return
	}

	result := models.GetThreadWithComments{
		GetThread: thread,
		Comments:  comments,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func CheckThreadOwner(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	var threadId int
	err := json.NewDecoder(r.Body).Decode(&threadId)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := jwtHandler.GetUserIDfromJWT(r)
	println("userid: ", userID)
	println("threadid: ", threadId)
	var count int
	err = db.QueryRow(`SELECT COUNT(*)
						FROM users 
						INNER JOIN threads ON user_id = op_id
						WHERE user_id = $1 AND thread_id = $2`, userID, threadId).Scan(&count)
	if err != nil {
		http.Error(w, "CheckThreadOwner: db query failed", http.StatusInternalServerError)
		return
	}

	if count != 1 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func MyThreads(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	userID := jwtHandler.GetUserIDfromJWT(r)

	req := `SELECT username,thread_id, user_id, thread_title, thread_info, thread_date
			FROM users 
			INNER JOIN threads ON user_id = op_id
			WHERE user_id = $1
			ORDER BY thread_date DESC`
	threadRows, err := db.Query(req, userID)
	if err != nil {
		http.Error(w, "MyThreads: db query failed", http.StatusInternalServerError)
		return
	}
	defer threadRows.Close()

	var threads []models.GetThread

	for threadRows.Next() {
		var thread models.GetThread
		err := threadRows.Scan(&thread.Username, &thread.Thread_id, &thread.Op_id, &thread.Thread_title, &thread.Thread_info, &thread.Thread_date)
		if err != nil {
			http.Error(w, "error during threadRows scan", http.StatusInternalServerError)
			return
		}
		threads = append(threads, thread)
	}
	err = threadRows.Err()
	if err != nil {
		http.Error(w, "error during threadRows iteration", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threads)
}

// ** For Comments: **
func CreateComment(w http.ResponseWriter, r *http.Request) {
	var comment string
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	db := OpenDb()
	defer db.Close()

	thread_id := URLGetThreadID(r)
	userID := jwtHandler.GetUserIDfromJWT(r)

	_, err = db.Exec(`
		INSERT INTO comments (thread_id, commenter_id, comment_info) VALUES ($1, $2, $3);`, thread_id, userID, comment)
	if err != nil {
		http.Error(w, "creating new comment failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Header().Set("Content-Type", "application/json")
}

func UpdateComment(w http.ResponseWriter, r *http.Request) {
	var comment string
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	comment_id := URLGetCommentID(r)
	userID := jwtHandler.GetUserIDfromJWT(r)
	println("commentid: ", comment_id)
	db := OpenDb()
	defer db.Close()

	var commenter_id int
	err = db.QueryRow(`SELECT commenter_id FROM comments WHERE comment_id = $1`, comment_id).Scan(&commenter_id)
	if err != nil {
		http.Error(w, "UpdateComment: unable to obtain commenter_id", http.StatusInternalServerError)
		return
	}

	// ensure user that original commenter and userID making delete req matches
	if commenter_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// proceed to update comment
	_, err = db.Exec(`UPDATE comments SET comment_info = $1, comment_date = CURRENT_TIMESTAMP WHERE comment_id = $2;`, comment, comment_id)
	if err != nil {
		http.Error(w, "unable to update comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	comment_id := URLGetCommentID(r)
	userID := jwtHandler.GetUserIDfromJWT(r)
	db := OpenDb()
	defer db.Close()

	var threadID, commenter_id int
	err := db.QueryRow(`SELECT thread_id, commenter_id FROM comments WHERE comment_id = $1`, comment_id).Scan(&threadID, &commenter_id)
	if err != nil {
		http.Error(w, "DeleteComment: unable to obtain thread_id, commenter_id", http.StatusInternalServerError)
		return
	}

	// ensure user that original commenter and userID making delete req matches
	if commenter_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// proceed to delete comment
	_, err = db.Exec(`
		DELETE FROM comments WHERE comment_id = $1`, comment_id)
	if err != nil {
		http.Error(w, "DeleteComment: unable to delete comments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threadID)
}

func GetCategories(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	categoryRows, err := db.Query("SELECT * FROM categories")
	if err != nil {
		http.Error(w, "error querying category rows", http.StatusInternalServerError)
		return
	}

	var categories []models.Category

	for categoryRows.Next() {
		var category models.Category
		err := categoryRows.Scan(&category.Category_id, &category.Category_name)
		if err != nil {
			http.Error(w, "error during categoryRows scan", http.StatusInternalServerError)
			return
		}
		categories = append(categories, category)
	}
	err = categoryRows.Err()
	if err != nil {
		http.Error(w, "error during categoryRows iteration", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
