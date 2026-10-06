const mineflayer = require('mineflayer');
const Movements = require('mineflayer-pathfinder').Movements;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { GoalBlock } = require('mineflayer-pathfinder').goals;
const schoolProjectPlugin = require('schoolproject');

const config = require('./settings.json');

const loggers = require('./logging.js');
const logger = loggers.logger;

function createBot() {
   const bot = mineflayer.createBot({
      username: config['bot-account']['username'],
      auth: config['bot-account']['type'],
      host: config.server.ip,
      port: config.server.port,
      version: config.server.version,
      colorsEnabled: false,
   });

   bot.loadPlugin(pathfinder);
   const mcData = require('minecraft-data')(bot.version);
   const defaultMove = new Movements(bot, mcData);

	bot.once('login', async () => {
		setTimeout(() => {
         const password = config.server['cracked-login-password'];
         if (password) {
            bot.chat(`/login ${password}`);
            setTimeout(() => {
               bot.chat('/server opfactions');
            }, 10000);
         } else {
            bot.chat('/server opfactions');
         }
		}, 10000)
	})

	bot.once('spawn', () => {
      bot.pathfinder.setMovements(defaultMove);
		logger.info('Bot joined to the server')
		setInterval(() => {
         if (config.utils['auto-feed']) {
            bot.chat('/feed');
            console.log('Sent /feed');
         }

			console.log(bot.player.ping)
		}, config.utils['auto-feed-delay'] * 1000)

      if (config.utils['auto-fix-hand']) {
         setInterval(() => {
            bot.chat('/fix hand');
            console.log('Sent /fix hand');
         }, config.utils['auto-fix-hand-delay'] * 1000)
      }

      if (config.utils['chat-messages'].enabled) {
         logger.info('Started chat-messages module');

         let messages = config.utils['chat-messages']['messages'];

         if (config.utils['chat-messages'].repeat) {
            let delay = config.utils['chat-messages']['repeat-delay'];
            let i = 0;

            setInterval(() => {
               bot.chat(`${messages[i]}`);

               if (i + 1 === messages.length) {
                  i = 0;
               } else i++;
            }, delay * 1000);
         } else {
            messages.forEach((msg) => {
               bot.chat(msg);
            });
         }
      }
      bot.on('spawn', function () {
         bot.loadPlugin(schoolProjectPlugin);
   
         setTimeout(() => {
   bot.schoolproject.options = {
                   max_distance: 3.2,
                   swing_through: ['experience_orb'],
                   blacklist: ['player', 'orb'],
                   stop_on_window: false,
                   always_swing: true,
                   delay: Math.floor(Math.random() * 223) + 111,
               }
            bot.schoolproject.start()
         }, 20000)
      })
   
      setInterval(() => {
         bot.setControlState('jump', true) //Jumps
         bot.setControlState('jump', false)
      }, 25000)
   
      bot.on('death', function () {
         bot.schoolproject.stop()
      })
      const pos = config.position;

      if (config.position.enabled) {
         logger.info(
             `Starting moving to target location (${pos.x}, ${pos.y}, ${pos.z})`
         );
         bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
      }

   });

   const botCommands = {
      help: () => `Available commands: !help, !status, !coords`,
      status: () => {
         const ping = bot.player && Number.isFinite(bot.player.ping) ? bot.player.ping : 'unknown';
         return `Bot is online. Ping: ${ping}ms.`;
      },
      coords: () => {
         const pos = bot.entity && bot.entity.position
            ? bot.entity.position
            : { x: 0, y: 0, z: 0 };

         return `Position: ${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}`;
      },
   };

   bot.on('chat', (username, message) => {
      if (config.utils['chat-log']) {
         logger.info(`<${username}> ${message}`);
      }

      const trimmedMessage = message.trim();
      if (!trimmedMessage.startsWith('!')) return;

      const [commandName, ...args] = trimmedMessage.slice(1).split(/\s+/);
      const command = botCommands[commandName.toLowerCase()];

      if (!command) {
         bot.chat(`Unknown command: !${commandName}. Try !help.`);
         return;
      }

      bot.chat(command(args));
   });

   bot.on('goal_reached', () => {
      if(config.position.enabled) {
         logger.info(
             `Bot arrived to target location. ${bot.entity.position}`
         );
      }
   });

   bot.on('death', () => {
      logger.warn(
         `Bot has been died and was respawned at ${bot.entity.position}`
      );
   });

   if (config.utils['auto-reconnect']) {
      bot.on('end', () => {
         setTimeout(() => {
            createBot();
         }, config.utils['auto-reconnect-delay']);
      });
   }

   bot.on('kicked', (reason) => {
      let reasonText = JSON.parse(reason).text;
      if(reasonText === '') {
         reasonText = JSON.parse(reason).extra[0].text
      }
      reasonText = reasonText.replace(/§./g, '');

      logger.warn(`Bot was kicked from the server. Reason: ${reasonText}`)
   }
   );


	bot.on('error', (err) => logger.error(`${err.message}`))

	bot.on('windowOpen', (window) => {
		console.log(`Window Opened: ${window.title}`)

		if (window.title.toUpperCase().includes('AFK')) {
			const item = window
				.containerItems()
				.find((item) => item.customName && item.customName.toUpperCase().includes('CONFIRM'))

			if (!item) return logger.error('No confirm found in afk window.')

			bot.clickWindow(item.slot, 0, 0)
		}
	})
}



createBot();
