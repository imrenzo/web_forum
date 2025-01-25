package main

import (
	"net/http"
	"os"

	"github.com/imrenzo/web_forum/internal/router"
	_ "github.com/lib/pq"
)

func main() {
	r := router.Setup()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// if err := http.ListenAndServe(":"+port, r); err != nil {
	// 	panic("listen and serve")
	// }
	if err := http.ListenAndServe("0.0.0.0:"+port, r); err != nil {
		panic(err)
	}
}
