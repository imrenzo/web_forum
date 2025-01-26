### File Structure
Notable files:
```
.
├── public
├── package.json
|── README.md
├── tsconfig.json
├── yarn.lock
└── src
    ├── components    ---> reusable code
    ├── pages
    |   ├── notFound.tsx        ---> error page
    |   ├── threadMethods.tsx   ---> handle CUD threads with server
    |   └── threadPages.tsx     ---> Homepage, MyThreads pages.
    |                                Reads threads & Updates comment with server
    ├── services
    |   ├── api.tsx    ---> URL for requests [change this if setting up locally]
    |   ├── apiService.tsx   ---> Services reused multiple times (front+backend)
    |   ├── authenticate.tsx    ---> Authentication for header styles/ ftns
    |   └── handleComment.tsx   ---> handle CD comments with server
    ├── types       ---> Interface and types to send and receive data from server
    ├── userManagement  ---> login, logout, signup, change password
    ├── App.tsx     ---> Routing for pages
    |
    etc...
```