module.exports = 
{
  apps : [{
    name: 'TradeToy_api', // application name 
    script: './server.js', // script path to pm2 start
    args: 'one two', // string containing all arguments passed via CLI to script
    instances: 1, // number process of application
    exec_mode : "cluster",
    autorestart: true, //auto restart if app crashes
    watch: false,
    wait_ready: true,
    kill_timeout : 3000,
    listen_timeout : 3000,
    max_memory_restart: '1G', // restart if it exceeds the amount of memory specified
    env: {
      NODE_ENV: 'development',
      NODE_PORT:3000,
      DB_INDEX:0,
      API_ROOT_URL : 'http://localhost:3000/'
  
 
    },
    env_production: {
      NODE_ENV: 'production',
      NODE_PORT:3000,

  
    }
  }],

};
