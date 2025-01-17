package models

type GetThread struct {
	Username     string `json:"username"`
	Thread_id    int    `json:"thread_id"`
	Op_id        int    `json:"user_id"`
	Thread_title string `json:"thread_title"`
	Thread_info  string `json:"thread_info"`
	Thread_date  string `json:"thread_date"`
}

type UserData struct {
	User_ID  int    `json:"userID"`
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

type GetThreadWithComments struct {
	GetThread GetThread  `json:"thread"`
	Comments  []Comments `json:"comments"`
}

type CreateThreadWithCategory struct {
	CreateThread CreateThread `json:"createThread"`
	Category     string       `json:"category"`
}

type CreateThread struct {
	Title      string `json:"title"`
	ThreadInfo string `json:"content"`
}

type CreateThreadWithCategories struct {
	CreateThread CreateThread `json:"createThread"`
	Category     string       `json:"category"`
}

type ThreadOwnerCheck struct {
	Username string `json:"username"`
	ThreadId int    `json:"threadId"`
}

type Category struct {
	Category_id   int    `json:"category_id"`
	Category_name string `json:"category_name"`
}
