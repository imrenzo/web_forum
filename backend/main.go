package main

import (
	"net/http"

	_ "github.com/lib/pq"

	"github.com/imrenzo/web_forum/internal/router"
)

func main() {
	r := router.Setup()
	port := ":8080"
	if err := http.ListenAndServe(port, r); err != nil {
		panic(err)
	}
}
