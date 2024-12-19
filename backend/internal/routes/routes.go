package routes

import (
	"github.com/go-chi/chi"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/users"
)

func SetUpRoutes(router chi.Router) {
	router.Get("/", database.LoadPosts)
	router.Post("/login", users.LogInUser)
}
