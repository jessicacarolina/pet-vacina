module.exports = {
  apps: [{
    name: 'pet-vacina',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}