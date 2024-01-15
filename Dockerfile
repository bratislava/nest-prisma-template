FROM node:20.10-alpine AS base
ENV NODE_ENV=production

FROM base AS app-base
RUN apk update \
 && apk add tini\
 && rm -rf /var/cache/apk/* \
 && mkdir -p /home/node/app \
 && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
ENTRYPOINT [ "/sbin/tini", "--" ]

FROM base AS build-base
WORKDIR /build
COPY package.json package-lock.json prisma ./
RUN npm ci --omit=dev --frozen-lockfile \
 && npx prisma generate

FROM build-base AS build
COPY --chown=node:node . ./

RUN npm run build
FROM build-base AS dev-build
RUN npm install --development

FROM app-base AS dev
ENV NODE_ENV=development
COPY --chown=node:node --from=dev-build /build/node_modules ./node_modules
CMD [ "npm", "run", "start:debug" ]

# production
FROM app-base AS prod
COPY --chown=node:node --from=build /build/package.json /build/package-lock.json ./
COPY --chown=node:node --from=build /build/node_modules ./node_modules
# RUN npm prune --production
COPY --chown=node:node --from=build /build/dist ./dist
COPY --chown=node:node --from=build /build/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json
EXPOSE 3000
ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/nest-prisma-template" \
      org.opencontainers.image.licenses="EUPL-1.2"
CMD [ "npm", "run", "start:migrate:prod" ]
