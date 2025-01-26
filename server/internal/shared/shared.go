// separate file to prevent import loop
package shared

import (
	"database/sql"
	"os"
)

func OpenDb() *sql.DB {
	// database url
	psqlInfo := os.Getenv("DATABASE_URL")
	if psqlInfo == "" {
		panic("DATABASE_URL is not set")
	}
	//
	
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
