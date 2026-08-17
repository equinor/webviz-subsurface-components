FROM mcr.microsoft.com/playwright:v1.60.0-noble

RUN mkdir -p /home/pwuser/test && chown -R pwuser:pwuser /home/pwuser/test
WORKDIR /home/pwuser/test

COPY package.json package-lock.json .npmrc ./

RUN npm ci

COPY .storybook ./.storybook

# Entrypoint accepts additional test-runner arguments
ENTRYPOINT ["npm", "run", "storybook:test"]
