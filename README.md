# Web Forum

## Description
### Simple Web Forum for NUS CVWO Winter Assignment AY24-25
Forum where users can start discussions on school subjects.

## Technologies used
### Frontend
React, Typescript, Axios, MUI, Render, HTML, CSS
### Backend
Go, Go-Chi, Render
### Database
Postgresql, Render

# Deployment
May take a while to load as i'm on Render Free plan.
Link: https://web-forum-test.onrender.com

# Authentication
- JSON Web Token (JWT) issued to authenticated users (Signed with HS256) with a 1 hour validity period
- When users perform CRUD operations on threads/comments, Chi.Router middleware will authenticate users. Then the USERID key from JWT is passed as a context to next http request
- Additionally for UD (Update & Delete) operations on threads/comments, more user authentication is done by:
  - Checking if USERID key in request context matches the thread/comment where UD is going to happen

## File Structure
Notable files:
```
.
├── client
    ├── public
    ├── package.json
    ├── tsconfig.json
    ├── yarn.lock
    └── src
        ├── apiService       
        ├── components
        ├── pages
        ├── types
        ├── userManagement
        └── App.tsx
├── server
    ├── main.go
    ├── go.mod
    ├── go.sum
    └── internal
        ├── authentication
        ├── database
        ├── models
        ├── router
        ├── routes
        ├── shared
        └── users
```

## Installation (for local)
1. install node v22.12.0
2. install yarn
3. install go 1.23.4
4. install postgresql 16/ 17
5. Run in terminal:

        #Clone this repository:
        git clone https://github.com/imrenzo/web_forum.git

        # Frontend:
        cd client
        yarn install
        yarn start

        # Backend:
        ## Start a new terminal:   
        cd server
        go mod tidy
        go run .

        # View link below for database

Database: Refer to here [a link](./database.txt)

Once you have run frontend, backend and database you should be good to go at http://localhost:3000/

## Database tables:
users, threads, comments, categories