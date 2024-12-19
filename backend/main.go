package main

import (
	_ "database/sql"
	_ "fmt"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	_ "github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	_ "github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"

	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/users"
)

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

	router.Get("/", database.LoadPosts)
	router.Post("/login", users.CheckValidUser)
	if err := http.ListenAndServe(port, router); err != nil {
		panic(err)
	}
}
