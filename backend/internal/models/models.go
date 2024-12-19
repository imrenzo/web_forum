package models

type Post struct {
	Post_title string `json:"post_title"`
	Post_id    int    `json:"post_id"`
	Op_id      int    `json:"op_id"`
	Post_info  string `json:"post_info"`
	Post_date  string `json:"post_date"`
}

type UserData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
