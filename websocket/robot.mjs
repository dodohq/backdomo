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

    /**
     * list of robots locations
     * robotID is used as key
     * @private {object<string:GPSData} locations
     */
    this.locations = {};
  }

  /**
   * add a client to a room
   * @param {ws.Client} client
   * @param {string} robotID
   */
  join(client, robotID) {
    if (!this.rooms[robotID]) {
      this.rooms[robotID] = { [client.id]: client };
      this.command(robotID, 'start');
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
        delete this.rooms[robotID][clientID];
      }

      if (Object.keys(this.rooms[robotID]).length === 0) {
        this.command(robotID, 'end');
        delete this.rooms[robotID];
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
      if (this.rooms[robotID]) {
        robotCli.send('start');
      }
    }
  }

  /**
   * deregister a robot's client
   * @param {string} robotID
   */
  deregister(robotID) {
    if (this.robots[robotID]) {
      delete this.robots[robotID];
    }
  }

  /**
   * broadCast send message to all subscribers in a room
   * @param {string} roomID
   * @param {Buffer} data
   */
  broadCast(roomID, data) {
    if (this.rooms[roomID]) {
      Object.values(this.rooms[roomID]).forEach(cli => {
        if (cli.readyState === WebSocket.OPEN) {
          cli.send(data);
        }
      });
    }
  }

  /**
   * send command to robot
   * @param {string} robotID
   * @param {enum<'start', 'end', 'up','down','left','right'>} cmd
   * corresponds to
   * - start streaming
   * - stop streaming
   * - go forward
   * - go backward
   * - turn left
   * - turn right
   */
  command(robotID, cmd) {
    if (this.robots[robotID]) {
      this.robots[robotID].send(cmd);
    }
  }

  /**
   * Get list of all connected robots
   * @return {Array.<Object>}
   */
  getOnlineRobots() {
    return Object.keys(this.robots);
  }

  /**
   * set location of a robot
   * @param {string} robotID
   * @param {any} locationData
   */
  setLocation(robotID, locationData) {
    console.log(robotID);
    this.locations[robotID] = JSON.parse(locationData);
  }

  /**
   * get location of a robot
   * @param {string} robotID
   * @return {any}
   */
  getLocation(robotID) {
    return this.locations[robotID];
  }
}

export default new RobotWS();
