# Board Games Galore Backend

Board Games Galore is a web application for board game enthusiasts to discover, share, and discuss their favorite games. This repository contains the backend server code, built using Node.js, Express.js, and MongoDB, to support the functionality of the application.

## Server.js Explained
My server.js lists out the important technologies and steps necessary for my backend server to work properly.

### (1) Import necessary modules
These include:
- dotenv (access secret, sensitive information)
- express (the main framework for Node.JS)
- cors (aka cross-origin resource sharing, allows requests from different domain)
- mongoose

### (2) Introduce middlewares via 'app.use'
Middleware functions in Express.js operate between the incoming request ('req') and the outgoing response ('res'), having access to both the request and resopnse of objects.
Some middlewares used include:
- **CORS (Cross-Origin Resource Sharing)**: Allows requests from different domains, enabling communication between the frontend and backend servers.
- **Express JSON Parser**: Middleware that parses incoming request bodies in JSON format, making the data accessible in the `req.body` object.

### (3) Define mongoDB connection, and connect via Mongoose

### (4) Define routers
Routers are used to modularize and organize the handling of different HTTP request paths/routes. 
- express.Router() is used so that variuos endpoints can be defined in separate files (located in "routes" folder)
- A route is defined for Cloudinary to handle image assets (post, delete, get, etc.)

### (5) Set up server once MongoDB connection is established from Step 3.
