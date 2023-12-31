const rgb = (r, g, b, msg) => `\x1b[38;2;${r};${g};${b}m${msg}\x1b[0m`;
const log = (...args) =>
  console.log(
    `[${rgb(88, 101, 242, 'arRPC')} > ${rgb(237, 66, 69, 'process')}]`,
    ...args
  );

const { readdir, readFile } = require('fs/promises');
const detectableDB = require('./detectable.json');

const timestamps = {},
  names = {},
  pids = {};
module.exports = class ProcessServer {
  constructor(handlers) {
    this.handlers = handlers;
    this.scan();
    setInterval(() => {
      this.scan();
    }, 5000);

    log('started');
  }

  async scan() {
    const processes = await this.getProcesses();
    const ids = [];

    for (const [pid, path] of processes) {
      const toCompare = [
        path.split('/').pop(),
        path.split('/').slice(-2).join('/'),
      ];

      for (const p of toCompare.slice()) {
        toCompare.push(p.replace('64', ''));
        toCompare.push(p.replace('.x64', ''));
        toCompare.push(p.replace('x64', ''));
      }

      for (const { executables, id, name } of detectableDB) {
        if (
          executables?.some(
            (x) => !x.isLauncher && toCompare.some((y) => x.name === y)
          )
        ) {
          names[id] = name;
          pids[id] = pid;
          ids.push(id);
          if (!timestamps[id]) {
            log('detected game!', name);
            timestamps[id] = Date.now();
            this.handlers.message(
              {
                socketId: id,
              },
              {
                cmd: 'SET_ACTIVITY',
                args: {
                  activity: {
                    application_id: id,
                    name,
                    timestamps: {
                      start: timestamps[id],
                    },
                  },
                  pid,
                },
              }
            );
          }
        }
      }
    }

    for (const id in timestamps) {
      if (!ids.includes(id)) {
        log('lost game!', names[id]);
        delete timestamps[id];

        this.handlers.message(
          {
            socketId: id,
          },
          {
            cmd: 'SET_ACTIVITY',
            args: {
              activity: null,
              pid: pids[id],
            },
          }
        );
      }
    }
  }

  async getProcesses() {
    const pids = (await readdir('/proc')).filter((f) => !isNaN(+f));
    return (
      await Promise.all(
        pids.map((pid) =>
          readFile(`/proc/${pid}/cmdline`, 'utf8').then(
            (path) => [+pid, path.replace(/\0/g, '')],
            () => {}
          )
        )
      )
    ).filter((x) => x);
  }
};
