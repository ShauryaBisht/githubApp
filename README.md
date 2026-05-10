# githubApp

> A GitHub App built with [Probot](https://github.com/probot/probot) that trial

# Features
- **Automated PR Size Labelling**
- **Issue Validation**
- **Role Based Assignment**
- **YAML config:** The bot's behaviour can be customized via `.github/config.yml` file in the host repository.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t trial .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> trial
```

## Contributing

If you have suggestions for how trial could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2026 Shaurya Bisht
