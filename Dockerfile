FROM node:10.16.0
WORKDIR /app
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start:dev"]