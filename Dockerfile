# Use AWS Public ECR Node.js base image
FROM public.ecr.aws/docker/library/node:18-alpine as runtime

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for development mode)
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the application port
EXPOSE 666

# Set environment variables
ENV NODE_ENV=development

# Default command for development
CMD ["npm", "run", "dev"]
