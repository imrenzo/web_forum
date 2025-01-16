export interface GetThread {
    username: string;
    thread_id: number;
    op_id: number;
    thread_title: string;
    thread_info: string;
    thread_date: string;
};

export interface Comment {
    username: string;
    comment_id: number;
    commenter_id: number;
    comment_info: string;
    comment_date: string;
};

export interface GetThreadsCardsProps {
    threads: GetThread[];
};

export type Comments = Comment[];

export interface ThreadWithComments {
    thread: GetThread | null;
    comments: Comments | null;
}

export interface Thread {
    title: string | null;
    content: string | null;
}
