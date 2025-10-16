### STAGE 1:BUILD ###
# Defining a node image to be used as giving it an alias of "build"
# Which version of Node image to use depends on project dependencies 
# This is needed to build and compile our code 
# while generating the docker image
FROM node:20-alpine AS build
# Work in app directory
WORKDIR /app
# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm cache clean --force && npm install --force
# Copy the rest of the source and build
COPY . .
RUN npm run build --prod

### STAGE 2:RUN ###
# Defining nginx image to be used
FROM nginx:latest
# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder 
COPY --from=build /app/dist/fuse /usr/share/nginx/html
COPY metrics /usr/share/nginx/html/metrics
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Exposing a port, here it means that inside the container 
# the app will be using Port 4200 while running
EXPOSE 4200
