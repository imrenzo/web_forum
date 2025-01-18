// separate file to prevent import loop
package shared

import (
	"database/sql"
	"fmt"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "root"
	dbname   = "web_forum"
)

func OpenDb() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	return db
}

// for jwtHandler to interact with DB
func UserIDExists(userID int) (bool, string) {
	db := OpenDb()
	defer db.Close()

	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE user_id = $1`, userID).Scan(&count)
	if err != nil {
		panic(err)
	}
	if count == 0 {
		return false, "UserID does not exist"
	} else if count > 1 {
		return false, "Internal Server Error"
	} else {
		return true, ""
	}
}
