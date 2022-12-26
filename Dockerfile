FROM node:14.0-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV PORT 80
EXPOSE $PORT
VOLUME ["/app/data"]
CMD ["npm", "start"]
# run-prod: docker run -d -p 80:5000 -v data:/app/data --name timer-api api-timer
# run-dev: docker run -d -p 80:5000 -v "/home/user/Projects/time-organizer-v2:/app" -v /app/node_modules -v data:/app/data --name timer-api api-timer