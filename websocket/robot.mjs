import WebSocket from 'ws';

/**
 * RobotWS Robot operations WebSocket hub
 */
class RobotWS {
  /**
   * create new instance of RobotWS
   */
  constructor() {
    /**
     * "rooms" for streaming to each robot
     * robotID is used as room identifier
     * @private {object<string:[]ws.Client>} rooms
     */
    this.rooms = {};

    /**
     * list of robots that's connected
     * @private {object<string:ws.Client>} robots
     */
    this.robots = {};
  }

  /**
   * add a client to a room
   * @param {ws.Client} client
   * @param {string} robotID
   */
  join(client, robotID) {
    if (!this.rooms[robotID]) {
      client.isController = true;
      this.rooms[robotID] = { [client.id]: client };
    } else if (!this.rooms[robotID][client.id]) {
      this.rooms[robotID][client.id] = client;
    }
  }

  /**
   * removed a disconnected client from a room
   * @param {string} clientID
   * @param {string} robotID
   */
  leave(clientID, robotID) {
    if (this.rooms[robotID]) {
      if (this.rooms[robotID][clientID]) {
        this.rooms[robotID][clientID] = undefined;
      }
    }
  }

  /**
   * register a robot's client to receive command
   * @param {string} robotID
   * @param {ws.Client} robotCli
   */
  register(robotID, robotCli) {
    if (this.robots[robotID]) {
      robotCli.close();
    } else {
      this.robots[robotID] = robotCli;
    }
  }

  /**
   * deregister a robot's client
   * @param {string} robotID
   */
  deresgiter(robotID) {
    if (this.robots[robotID]) {
      this.robots[robotID] = undefined;
    }
  }

  /**
   * broadCast send message to all subscribers in a room
   * @param {string} roomID
   * @param {Buffer} data
   */
  broadCast(roomID, data) {
    this.rooms[roomID].forEach(cli => {
      if (cli.readyState === WebSocket.OPEN) {
        cli.send(data);
      }
    });
  }

  /**
   * send command to robot
   * @param {string} robotID
   * @param {enum<'up','down','left','right'>} cmd
   */
  command(robotID, cmd) {
    if (this.robots[robotID]) {
      this.robots[robotID].send(cmd);
    }
  }
}

export default new RobotWS();
