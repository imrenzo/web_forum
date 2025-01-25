# Web Forum

## Description
### Simple Web Forum for NUS CVWO Winter Assignment AY24-25
Forum where users can start discussions on different subjects. 

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

## Installation

Clone this repository:
        
        git clone https://github.com/imrenzo/web_forum.git

Frontend:

In web_forum folder:

        cd ./client
        yarn install
        yarn start

Backend:

Start a new terminal and in web_forum folder:

        cd ./server
        go mod tidy
        go run .

Database: Refer to here[a link](./database.txt)

Once you have run frontend, backend and database you should be good to go at http://localhost:3000/

## Database tables:
users, threads, comments, categories