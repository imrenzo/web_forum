package models

// for reading thread with comments
type GetThreadWithComments struct {
	GetThread GetThread  `json:"thread"`
	Comments  []Comments `json:"comments"`
}

type GetThread struct {
	Username      string `json:"username"`
	Thread_id     int    `json:"thread_id"`
	Op_id         int    `json:"user_id"`
	Thread_title  string `json:"thread_title"`
	Thread_info   string `json:"thread_info"`
	Thread_date   string `json:"thread_date"`
	Category_name string `json:"category_name"`
}

type Comments struct {
	Username     string `json:"username"`
	Comment_id   int    `json:"comment_id"`
	Commenter_id int    `json:"commenter_id"`
	Comment_info string `json:"comment_info"`
	Comment_date string `json:"comment_date"`
}

//

// for posting threads
type CreateThreadWithCategory struct {
	CreateThread CreateThread `json:"createThread"`
	Category     string       `json:"category"`
}

type Category struct {
	Category_id   int    `json:"category_id"`
	Category_name string `json:"category_name"`
}

type CreateThread struct {
	Title      string `json:"title"`
	ThreadInfo string `json:"content"`
}

// for user related models
type UserData struct {
	User_ID  int    `json:"userID"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type ThreadOwnerCheck struct {
	Username string `json:"username"`
	ThreadId int    `json:"threadId"`
}

type ChangePassword struct {
	PrevPassword string `json:"prevPassword"`
	NewPassword  string `json:"newPassword"`
}

//
