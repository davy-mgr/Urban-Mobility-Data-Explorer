FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm install --prefix ./backend

COPY backend ./backend

COPY database ./database

RUN mkdir -p ./backend/src/data

EXPOSE 3001

CMD ["npm", "run", "dev", "--prefix", "./backend"]
