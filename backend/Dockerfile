FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","src/server.js"]
