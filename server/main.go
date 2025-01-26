package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/imrenzo/web_forum/internal/router"
	_ "github.com/lib/pq"
)

// render keeps having: No open ports detected, continuing to scan...
// delaying go from running on load by very long, even though app already listening and serving a port below
// so this ftn will tell render that app is working ok
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}

func main() {
	r := router.Setup()

	http.HandleFunc("/health", healthCheck)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := http.ListenAndServe("0.0.0.0:"+port, r); err != nil {
		panic(err)
	}
}
