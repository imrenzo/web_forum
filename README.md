# Web Forum

## Description
### Simple Web Forum for NUS CVWO Winter Assignment AY24-25
Forum where users can start discussions on school subjects.

## Technologies used
### Frontend
React, Typescript, Axios, MUI, HTML, CSS
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
- Users can perform CRUD operations on threads and posts
- Users can filter for thread based on their categories using the Subjects dropdown box
- Users can search for threads based on search bar
    - Search bar filters (with RegEx) to ensure that the search query + posts' title/ info matches word for word
    - Search bar ignores multiple whitespaces between words and will function properly
- Upon logging in Users may view their own thread posts

# Authentication/ Security

### Password/ Hashing
- Users log in and sign up with username and password
- When signing up, passwords are securely hashed with bcrypt
- Only hashed passwords are stored on database
- When logging in, password user enters is compared with hashed password on database for authentication

### JWT
- JSON Web Token (JWT) issued to authenticated users. It is signed with HS256 with a certain validity period
- When users perform CRUD operations on threads/comments, Chi.Router middleware will authenticate users with their JWT signature and validity period. If authenticated, the USERID key from JWT is passed as a context to next http request
- Additionally for UD (Update & Delete) operations on threads/comments, further up user authentication is done by:
  - Checking if USERID key in request context matches that of the thread/comment where UD is going to happen

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

    Clone this repository:
    
        git clone https://github.com/imrenzo/web_forum.git

    Backend:   
    
        cd server
        go mod tidy
        
        
        ### View text file link below for backend then
        go run .

    Frontend: Start a new terminal then,

        cd client
        yarn install


        ### View text file link below for frontend
        yarn build
        yarn start

Frontend: Refer to [here](./client.txt)

Backend & Database: Refer to [here](./database.txt)

Once you have run frontend, backend and database you should be good to go at http://localhost:3000/

## Database Tables:
users, threads, comments, categories

## Acknowledgements
This project was created using 
- [React](https://reactjs.org/), [Axios](https://axios-http.com/), [React Router DOM](https://reactrouter.com/), [MUI](https://mui.com/)
- [go-chi](https://github.com/go-chi/chi), [golang-jwt](https://github.com/golang-jwt), 
[golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto), [jwtSecret.com](https://jwtsecret.com/generate), [pq](https://github.com/lib/pq)