package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/users"
)

func SetUpRoutes(router chi.Router) {
	router.Get("/", database.LoadPosts)
	router.Get("/post_id/{num}", database.SinglePostAndComments)
	// router.Put("/post_id/{num}", database.SinglePostAndComments)
	router.Post("/createThread", database.CreateThread)
	router.Post("/login", users.LogInUser)
	router.Post("/signup", users.SignUpUser)
}
