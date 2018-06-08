import WebSocket from 'ws';
import jwt from 'jsonwebtoken';

import robotWS from '../../websocket/robot';
import getQueryParams from '../../lib/utils/get_query_params';

const userWSServer = new WebSocket.Server({
  noServer: true,
  perMessageDeflate: true,
  path: '/user',
});

userWSServer.on('connection', (cli, upgradeReq) => {
  const { token, robot_id: robotID } = getQueryParams(upgradeReq.url);
  if (!token) return cli.close();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return cli.close();
    if (decoded.exp <= Date.now() / 1000) {
      return cli.close();
    }
    if (!decoded.is_admin) return cli.close();

    cli.id = decoded._id;
    cli.robotID = robotID;
    robotWS.join(cli, robotID);
    cli.on('close', () => robotWS.leave(cli.id, robotID));
  });
});

export default userWSServer;
