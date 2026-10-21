package main

import (
	"log"
	"net/http"
	"os"

	"github.com/imrenzo/web_forum/internal/authentication"
	"github.com/imrenzo/web_forum/internal/router"
	_ "github.com/lib/pq"
)

func main() {
	// fail at startup, not on the first request
	for _, name := range []string{"DATABASE_URL", "JWT_SECRET"} {
		if os.Getenv(name) == "" {
			log.Fatalf("%s is not set (see .env.example)", name)
		}
	}
	authentication.GetSecretKey()

	r := router.Setup()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := http.ListenAndServe("0.0.0.0:"+port, r); err != nil {
		panic(err)
	}
}
