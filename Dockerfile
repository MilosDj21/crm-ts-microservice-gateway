FROM node:18
WORKDIR /app
COPY package.json .

#Get argument from compose file, and based on it install dev or prod deps from package.json
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
	then npm install; \
	else npm install --only=production; \
	fi

COPY . .

#Sets env variable which is available for every container that uses this image
#Can be overriden when composing container
ENV PORT 5000

#Expose is only used to inform which port image expects to be forwarded
#Port needs to be forwarded when composing container
EXPOSE $PORT
CMD ["node", "index.js"]
