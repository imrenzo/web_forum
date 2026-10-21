package router

import (
	"os"
	"strings"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/imrenzo/web_forum/internal/routes"
)

// CORS_ORIGINS is a comma-separated list; defaults to the local client
func allowedOrigins() []string {
	if v := os.Getenv("CORS_ORIGINS"); v != "" {
		return strings.Split(v, ",")
	}
	return []string{"http://localhost:3000"}
}

func Setup() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	// the JWT travels in the Authorization header, so cookies/credentials are not needed
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: allowedOrigins(),
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}))
	routes.SetUpRoutes(r)
	return r
}
