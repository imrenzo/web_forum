# Subject Forum

Creator: Chua Renzo
## Description
### Simple Web Forum for NUS CVWO Winter Assignment AY24-25
Web Forum where Students can start discussions on school subjects.

## Technologies used
### Frontend
React.js, Typescript, Axios, MUI, HTML, CSS
### Backend
Golang, Go-Chi
### Database
Postgresql
### Authentication
JWT, bcrypt
### Hosting & Deployment
Render

# Deployment
May take a while to load as i'm on Render Free plan

Website link: https://web-forum-test.onrender.com

# Features
- Users will be able to view threads and comments (on each thread) regardless of logging in
- Users can perform CRUD operations on threads and comments
- Users can filter for threads based on their categories using the Subjects dropdown box
- Users can search for threads based on search bar
    - Search bar uses filtering (with RegEx) to ensure that the search query matches word for word with the threads' title/ info
    - Search bar ignores multiple whitespaces between words and will function properly
- Upon logging in Users may view their own threads
- Users are able to change their password

# Authentication/ Security

### Password/ Hashing
- Users log in and sign up with username and password
- When signing up, passwords are securely hashed with bcrypt
- Only hashed passwords are stored on database
- When logging in, password user enters is compared with hashed password on database for authentication

### JWT
- JSON Web Token (JWT) issued to authenticated users and stored on localStorage. It is signed with HS256 with a certain validity period.
- When users perform CRUD operations on threads/ comments, Chi.Router middleware will authenticate users with their JWT signature and validity period. 
- If authenticated, the USERID key from JWT is passed as a context to next http request
- Additionally for UD (Update & Delete) operations on threads/comments, further user authentication is done by:
  - Checking if USERID key in request context matches that of the thread/comment where UD is going to happen

## File Structure
```
.
├── client
    ├── public
    ├── package.json
    ├── tsconfig.json
    ├── yarn.lock
    └── src
        ├── services    
        ├── components
        ├── pages
        ├── types
        ├── userManagement
        ├── App.tsx
        |
        ...
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
4. Run in terminal:

    Clone this repository:
    
        git clone https://github.com/imrenzo/web_forum.git

    Then for backend:   
    
        cd server
        go mod tidy
        go run .

    Frontend: Start a **new terminal** then,

        cd client
        yarn install
        cd src/services
        code api.tsx

    Then, in api.tsx: __Change URL to development URL__, save then:

        yarn build
        yarn start

Once you have run frontend, backend and database the website should appear at http://localhost:3000/

Backend is at http://localhost:8080/

Database url is in (./server/internal/database/database.go). Assigned to variable psqlInfo

## Database Tables:
users, threads, comments, categories

## Acknowledgements
This project was created using 
- [React](https://reactjs.org/), [Axios](https://axios-http.com/), [React Router DOM](https://reactrouter.com/), [MUI](https://mui.com/)
- [go-chi](https://github.com/go-chi/chi), [golang-jwt](https://github.com/golang-jwt), 
[golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto), [jwtSecret.com](https://jwtsecret.com/generate), [pq](https://github.com/lib/pq)