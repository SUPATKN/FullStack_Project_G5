FROM node:22-alpine3.19 AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN mkdir ./dist/images
RUN mkdir ./dist/profile_picture
# ENV NODE_ENV production
ENV NODE_ENV development
ENV PORT 3000
ENV FRONTEND_URL=http://localhost:5899
ENV GOOGLE_CLIENT_ID=1055172628970-eu16pf695iclrqrpcc2963t4uitikab3.apps.googleusercontent.com
ENV GOOGLE_CLIENT_SECRET=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
ENV GOOGLE_CALLBACK_URL=http://localhost:3000/callback/google
ENV GOOGLE_TOKEN_URL=https://oauth2.googleapis.com/token
ENV GOOGLE_AUTHORIZATION_URL=https://accounts.google.com/o/oauth2/v2/auth
EXPOSE 3000
CMD ["npm", "run", "start"]