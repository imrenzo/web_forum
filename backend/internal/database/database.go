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

// // Create Threads (checking that user in context from jwt middleware & user making thread are the same person)and
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
		INSERT INTO threads (op_id, thread_title, thread_info) VALUES ($1, $2, $3);`, userID, createThreadInfo.Title, createThreadInfo.ThreadInfo)

	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	//get thread_id so that can load back into page
	var thread_id int
	err = db.QueryRow("SELECT thread_id FROM threads WHERE op_id = $1 AND thread_title = $2 AND thread_info = $3",
		userID, createThreadInfo.Title, createThreadInfo.ThreadInfo).Scan(&thread_id)
	if err != nil {
		panic(err)
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
	thread_idStr := chi.URLParam(r, "id")
	thread_id, err := strconv.Atoi(thread_idStr)
	if err != nil {
		panic(err)
	}

	userID := jwtHandler.GetUserIDfromJWT(r)

	// ensure user that original poster and userID making update req matches
	var op_id int
	err = db.QueryRow("SELECT op_id FROM threads WHERE thread_id = $1", thread_id).Scan(&op_id)
	if err != nil {
		panic(err)
	}

	if op_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// update thread
	_, err = db.Query("UPDATE threads SET thread_title = $1, thread_info = $2 WHERE thread_id = $3;", createThreadInfo.Title, createThreadInfo.ThreadInfo, thread_id)
	if err != nil {
		panic(err)
	}

	w.WriteHeader(http.StatusNoContent)
}

func DeleteThread(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	thread_idStr := chi.URLParam(r, "id")
	thread_id, err := strconv.Atoi(thread_idStr)
	if err != nil {
		panic(err)
	}

	userID := jwtHandler.GetUserIDfromJWT(r)

	// ensure user that original poster and userID making delete req matches
	var op_id int
	err = db.QueryRow("SELECT op_id FROM threads WHERE thread_id = $1", thread_id).Scan(&op_id)
	if err != nil {
		panic(err)
	}

	if op_id != userID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// deletes threads and comments associated with it as comments have foreign key constraint
	_, err = db.Query("DELETE FROM comments WHERE thread_id = $1", thread_id)
	if err != nil {
		panic(err)
	}

	_, err = db.Query("DELETE FROM threads WHERE thread_id = $1", thread_id)
	if err != nil {
		panic(err)
	}

	w.WriteHeader(http.StatusNoContent)
}

// ////////// Read Threads and Comments ////////////
func AllThreads(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()

	req := `SELECT username,thread_id, user_id, thread_title, thread_info, thread_date
			FROM users 
			INNER JOIN threads ON user_id = op_id
			ORDER BY thread_date DESC`
	threadRows, err := db.Query(req)
	if err != nil {
		panic(err)
	}
	defer threadRows.Close()

	var threads []models.GetThread

	for threadRows.Next() {
		var thread models.GetThread
		err := threadRows.Scan(&thread.Username, &thread.Thread_id, &thread.Op_id, &thread.Thread_title, &thread.Thread_info, &thread.Thread_date)
		if err != nil {
			panic(err)
		}
		threads = append(threads, thread)
	}
	err = threadRows.Err()
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threads)
}

func SingleThreadAndComments(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		panic(err)
	}

	var thread models.GetThread
	err = db.QueryRow(`
		SELECT username,thread_id, user_id, thread_title, thread_info, thread_date
		FROM users INNER JOIN threads ON user_id = op_id
		WHERE thread_id = $1`, id).
		Scan(&thread.Username, &thread.Thread_id, &thread.Op_id, &thread.Thread_title, &thread.Thread_info, &thread.Thread_date)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "Thread query does not exist"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	commentRows, err := db.Query(`
		SELECT username, comment_id, commenter_id, comment_info, comment_date
		FROM users INNER JOIN comments ON user_id = commenter_id
		WHERE thread_id = $1
		ORDER BY comment_date DESC`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "Thread query does not exist"}`, http.StatusNotFound)
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
		panic(err)
	}
	println("count: ", count)
	if count != 1 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func MyThreads(w http.ResponseWriter, r *http.Request) {
	db := OpenDb()
	defer db.Close()
	println("test")
	userID := jwtHandler.GetUserIDfromJWT(r)
	println("tested")
	req := `SELECT username,thread_id, user_id, thread_title, thread_info, thread_date
			FROM users 
			INNER JOIN threads ON user_id = op_id
			WHERE user_id = $1
			ORDER BY thread_date DESC`
	threadRows, err := db.Query(req, userID)
	if err != nil {
		panic(err)
	}
	defer threadRows.Close()

	var threads []models.GetThread

	for threadRows.Next() {
		var thread models.GetThread
		err := threadRows.Scan(&thread.Username, &thread.Thread_id, &thread.Op_id, &thread.Thread_title, &thread.Thread_info, &thread.Thread_date)
		if err != nil {
			panic(err)
		}
		threads = append(threads, thread)
	}
	err = threadRows.Err()
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threads)
}
