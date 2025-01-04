package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/jwtHandler"
	"github.com/imrenzo/web_forum/internal/users"
)

func SetUpRoutes(router chi.Router) {
	router.Get("/", database.LoadPosts)
	router.Get("/post_id/{id}", database.SinglePostAndComments)
	// router.Put("/post_id/{num}", database.SinglePostAndComments)
	router.With(jwtHandler.TokenVerifyMiddleware).Post("/checkpostowner", database.CheckPostOwner)
	
	router.With(jwtHandler.TokenVerifyMiddleware).Post("/createThread", database.CreateThread)
	router.With(jwtHandler.TokenVerifyMiddleware).Delete("/delete_thread/{id}", database.DeleteThread)
	// user handling
	router.Get("/authenticate", jwtHandler.DirectAuthenticate)
	router.Post("/login", users.LogInUser)
	router.Post("/signup", users.SignUpUser)
}
