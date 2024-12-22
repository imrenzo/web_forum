package models

type Post struct {
	Username   string `json:"username"`
	Post_id    int    `json:"post_id"`
	Op_id      int    `json:"user_id"`
	Post_title string `json:"post_title"`
	Post_info  string `json:"post_info"`
	Post_date  string `json:"post_date"`
}

type UserData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Comments struct {
	Username     string `json:"username"`
	Comment_id   int    `json:"comment_id"`
	Commenter_id int    `json:"commenter_id"`
	Comment_info string `json:"comment_info"`
	Comment_date string `json:"comment_date"`
}

type PostWithComments struct {
	Post       Post       `json:"post"`
	Comments []Comments `json:"comments"`
}

type CreateThread struct {
	Op_id		int		`json:"op_id"`
	Title		string	`json:"title"`
	ThreadInfo	string	`json:"content"`
}