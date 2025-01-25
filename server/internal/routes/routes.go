package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/imrenzo/web_forum/internal/authentication"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/users"
)

func SetUpRoutes(router chi.Router) {
	// user management & authentication
	router.Get("/authenticate", authentication.DirectAuthenticate)
	router.Post("/user/login", users.LogInUser)
	router.Post("/user/signup", users.SignUpUser)

	// ** For threads **
	// read db for threads
	router.Get("/", database.AllThreads)
	router.Get("/thread/read/{id}", database.SingleThreadAndComments)
	router.With(authentication.TokenVerifyMiddleware).Get("/mythreads", database.MyThreads)
	router.With(authentication.TokenVerifyMiddleware).Post("/checkthreadowner", database.CheckThreadOwner)

	// create, update, delete thread
	router.With(authentication.TokenVerifyMiddleware).Post("/thread/create", database.CreateThread)
	router.With(authentication.TokenVerifyMiddleware).Put("/thread/update/{id}", database.UpdateThread)
	router.With(authentication.TokenVerifyMiddleware).Delete("/thread/delete/{id}", database.DeleteThread)

	// ** For Comments **
	router.With(authentication.TokenVerifyMiddleware).Post("/comment/{id}", database.CreateComment)
	router.With(authentication.TokenVerifyMiddleware).Put("/comment/update/{commentID}", database.UpdateComment)
	router.With(authentication.TokenVerifyMiddleware).Delete("/comment/delete/{commentID}", database.DeleteComment)

	router.Get("/categories/get", database.GetCategories)
}
