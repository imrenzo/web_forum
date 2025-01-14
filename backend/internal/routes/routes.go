package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/imrenzo/web_forum/internal/database"
	"github.com/imrenzo/web_forum/internal/jwtHandler"
	"github.com/imrenzo/web_forum/internal/users"
)

func SetUpRoutes(router chi.Router) {
	// user management & authentication
	router.Get("/authenticate", jwtHandler.DirectAuthenticate)
	router.Post("/user/login", users.LogInUser)
	router.Post("/user/signup", users.SignUpUser)

	// ** For threads **
	// read db for threads
	router.Get("/", database.AllThreads)
	router.Get("/thread/read/{id}", database.SingleThreadAndComments)
	router.With(jwtHandler.TokenVerifyMiddleware).Get("/mythreads", database.MyThreads)
	router.With(jwtHandler.TokenVerifyMiddleware).Post("/checkthreadowner", database.CheckThreadOwner)

	// create, update, delete thread
	router.With(jwtHandler.TokenVerifyMiddleware).Post("/thread/create", database.CreateThread)
	router.With(jwtHandler.TokenVerifyMiddleware).Put("/thread/update/{id}", database.UpdateThread)
	router.With(jwtHandler.TokenVerifyMiddleware).Delete("/thread/delete/{id}", database.DeleteThread)

	// ** For Comments **
	router.With(jwtHandler.TokenVerifyMiddleware).Post("/comment/{id}", database.CreateComment)
	router.With(jwtHandler.TokenVerifyMiddleware).Delete("/comment/delete/{commentID}", database.DeleteComment)

}
