[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/6obdcLqg)





## Introduction

In this Assignment, you will make a complete MPA web application with multiple routes and logins, in particular a simple social media aggregator, like Diggg.

You should use Node, Express, and EJS (and HTML).  You may use CSS to make it nice if you like.

This Assignment is worth 25% of your final grade.


## Intellectual Honesty

Please remember that this assignment is **individual work**.  You may use any online resource that already existed a week ago, but you may not ask anyone to look at your code, or show you their code, and you may not show your code to anyone else.

If in doubt about what conduct is fair, ask me.

Also the previous advice about SOURCES.md is still in play.


## Due Date

This Assignment is due on Sunday, March 3rd, at 11:59pm.

## Submission

You presumably got this assignment via GitHub Classroom.  Submit it the same way.

If you are using a different GitHub account than you used in prior assignment, make sure I know about it.




## Concepts

In this project there are multiple types of resources.

There are *articles*, which are basically just links to external resources.  They have a URL, and a title, and maybe also some commentary text.

There are *comments*, on articles, which are basically just some text.

There are *subjeddits*, aka "subs", which organize several articles together under a theme.

There are *users*, because every sub, every article, and every comment, needs to know which user it belongs to.




## PASS tier

This is a straightforward extension of the skills from Jiki.  You're going to make a CRUD app with 3 ~~database tables~~ resource types, plus user login and registration, and using Express.Router to organize the code.

At this level, there is only one type of user, so all users have equivalent permissions.

* as with Jiki, you need to start the project
    * `npm init` and `npm install nodemon express body-parser ejs`
    * probably add a script for nodemon, eh
    * I'll give you a starting `index.js`, but you might want to add things to it, like adding more middlewares if you want, or other ideas
* required routes for main resource types
    * `GET /`
        * this should simply redirect to `GET /subs/list`
    * routes for subjeddits:
        * all these route-handlers should be defined in an Express.Router, in a file with a suitable name like `subsRouter.js`
        * `GET /subs/list`
            * this should simply list all the subs that exist, in any order
            * it needs a link to create a new subjeddit, of course
        * `GET /subs/show/:id`
            * this should show every article within the subjeddit, in any order
            * should have a link to create a new article within the sub, and a link to the homepage
        * `GET /subs/create`
        * `POST /subs/create`
    * routes for articles within a subjeddit:
        * it'd be more thematic if I called these "posts" or "links", but those are both confusing terms, so let's use "articles"
        * all these route-handlers should be defined in an Express.Router, in a file with a suitable name like `articlesRouter.js`
        * you don't need to be able to list articles, because that's what subjeddits are for
        * `GET /articles/show/:id`
        * `GET /articles/create`
            * this is the route to create a new article.  you must link to this route from the `/subs/show/:id` route, and the article must be automatically added to the relevant subjeddit, without the user doing anything
            * you MAY, if you choose, instead put this route at `GET /subs/show/:id/articles/create`
        * `POST /articles/create`
        * `GET /articles/edit/:id`
        * `POST /articles/edit/:id`
        * `GET /articles/delete/:id`
        * `POST /articles/delete/:id`
    * routes for comments, which are attached to a subjeddit:
        * all these route-handlers should be defined in an Express.Router, in a file with a suitable name like `commentsRouter.js`
        * you don't need to be able to list comments, because that's what articles are for
        * also articles are used for the comment-creation form
        * `GET /comments/show/:id`
        * `POST /comments/create`
        * `GET /comments/edit/:id`
        * `POST /comments/edit/:id`
        * `GET /comments/delete/:id`
        * `POST /comments/delete/:id`
* suggested routes to help your development process:
    * I personally find these *really helpful*, I *strongly suggest* you do them for your own benefit
    * `GET /debug_db`
        * this would call `db.debug.log_debug()` and then `res.send("check the console")`
    * `POST /reset_db`
        * this would call `db.debug.reset_and_seed()` and then `res.send("check the console")`
* user logins and registration
    * all relevant route-handlers should be defined in an Express.Router, in a file with a suitable name like `usersRouter.js`
    * `GET /users/login`
    * `POST /users/login`
        * if successful, redirect to `/`
    * `GET /users/register`
    * `POST /users/register`
        * if successful, redirect to `/`
    * `POST /users/logout`
        * if successful, redirect to `/`
    * `GET /users/profile/:id`
    * cookie security
        * cookie security must be good enough that I cannot casually change my user_id with the dev tools
        * in other words, maybe just use `cookie-session`
    * password security
        * all passwords must be hashed in the DB, using `bcrypt`
* authentication and authorization
    * some routes must work whether or not you are logged in
        * all routes for listing and viewing subs, articles, and comments, and user profiles
        * also the root route (`/`), and any debug routes you're using for debugging during dev
    * some routes work only if you are NOT logged in
        * all routes to do with login and registration, including the GETs and POSTs
    * some routes only work if you are logged in, but any user is good enough
        * all routes for creating subs, articles, and comments
        * logout
    * some routes only work if you are logged in, as the correct user
        * routes editing, and deleting, your own articles and comments
    * remember that the bad guy can modify HTML forms in their dev tools, and your app should stay secure
    * remember that the bad guy can modify cookies in their dev tools, and your app should stay secure
* header on every page
    * every page should have a header with a link to `/`, and information about whether the user is logged in or not
    * if they're logged in, add a logout button
    * if they're not logged in, add links to log in and to register
    * optional: I personally also added a link for debugging to my header

    
Remember to think about code presentation.  That's all the concerns from the previous assignment (variable names, indentation, general tidiness), plus also now you need to organize code into multiple files in a way that doesn't cause misery to yourself or others.



## SATIS tier

More detail will come, but the main feature will be making voting work, on articles and comments.


## EXEMP tier

More details will come, but the main feature will be nested comments, and maybe also mods for subjeddits. 

