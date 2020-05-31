module.exports = {
  apps: [{
    name: "Voucher",
    script: "./bin/www",
    watch: true,
    env: {
      "PORT": 3000,
      "NODE_ENV": "development"
    },
    env_staging: {
      "PORT": 2058,
      "NODE_ENV": "staging",
    },
    env_production: {
      "watch": false,
      "PORT": 2001,
      "NODE_ENV": "production",
    },
    env_uat: {
      "watch": false,
      "PORT": 2000,
      "NODE_ENV": "staging",
    }
  }]
}
