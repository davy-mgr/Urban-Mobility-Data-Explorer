FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY ../database ./database
RUN mkdir -p ./src/data

EXPOSE 3001

CMD ["npm", "run", "dev"]
