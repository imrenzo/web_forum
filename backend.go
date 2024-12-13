package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "root"
	dbname   = "web_forum"
)

func main() {

	// database quries
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	sqlstatement := `SELECT * from users`
	rows, err := db.Query(sqlstatement)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var name, password string

		// Scan the result into variables
		err := rows.Scan(&id, &name, &password)
		if err != nil {
			panic(err)
		}

		// Print the results
		fmt.Printf("ID: %d, Name: %s, Password: %s\n", id, name, password)
	}

	// Check for any errors encountered during the iteration
	err = rows.Err()
	if err != nil {
		panic(err)
	}
}
