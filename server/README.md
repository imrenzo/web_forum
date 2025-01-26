### File Structure
```
.
├── main.go
├── go.mod
├── go.sum
|── README.md
└── internal
    ├── authentication  ---> contains JWT & authentication functions
    ├── database    ---> handles database queries for CRUD
    ├── models      ---> models for program
    ├── router      ---> Chi router & CORS is here
    ├── routes      ---> Routing of API Endpoints
    ├── shared      ---> Only created this file to prevent import loop
    └── users       ---> login, signup, change password, password hashing
```