export interface Post {
    username: string;
    post_id: number;
    op_id: number;
    post_title: string;
    post_info: string;
    post_date: string;
};

export interface Comment {
    username: string;
    comment_id: number;
    commenter_id: number;
    comment_info: string;
    comment_date: string;
};

export interface PostsCardsProps {
    posts: Post[];
};

export type Comments = Comment[];

export interface PostWithComments {
    post: Post | [];
    comments: Comments | [];
}

export interface Thread {
    op_id: Number | null;
    title: string | null;
    content: string | null;
}