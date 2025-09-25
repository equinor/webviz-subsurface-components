FROM mcr.microsoft.com/playwright:v1.39.0-jammy

RUN mkdir -p /home/pwuser/test && chown -R pwuser:pwuser /home/pwuser/test
WORKDIR /home/pwuser/test

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY .storybook ./.storybook

# Create entrypoint that accepts additional arguments
ENTRYPOINT ["npm", "run", "storybook:test"]
