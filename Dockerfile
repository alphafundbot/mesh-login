FROM node:20-alpine

WORKDIR /mesh

# Copy all components
COPY ./frontend ./frontend
COPY ./mcp-server ./mcp-server
COPY ./iam ./iam
COPY .env.local .env.local
COPY strategist.config.json strategist.config.json
COPY keys/ keys/

# Install dependencies
RUN cd frontend && npm install
RUN cd mcp-server && npm install
RUN cd iam && npm install

# Expose ports
EXPOSE 9002 8080

# Start all services
CMD sh -c "node iam/daemon.ts & cd frontend && npm run dev & cd mcp-server && npm start"