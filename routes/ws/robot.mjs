import WebSocket from 'ws';
import jwt from 'jsonwebtoken';

import robotWS from '../../websocket/robot';
import getQueryParams from '../../lib/utils/get_query_params';

const robotStreamingWSServer = new WebSocket.Server({
  noServer: true,
  perMessageDeflate: true,
  path: '/robot',
});

robotStreamingWSServer.on('connection', (cli, upgradeReq) => {
  const { token } = getQueryParams(upgradeReq.url);
  if (!token) return cli.close();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return cli.close();
    if (!decoded.is_robot) return cli.close();

    robotWS.register(decoded._id, cli);
    cli.on('close', () => robotWS.deregister(decoded._id));
    cli.on('message', gpsData => robotWS.setLocation(decoded._id, gpsData));
  });
});

export default robotStreamingWSServer;
