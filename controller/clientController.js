import Manager from "../models/manager.js";
import Client from "../models/client.js";
import * as Auth from "../utils/auth.js";

// 매니저 정보 GET
const getManagerInfo = async (req, res, next) => {
  const { managerPk } = req.query;
  if (!managerPk)
    return res.status(404).json({
      msg: "url 정보를 다시 확인해 주세요",
      code: "NOT_MANAGER_KEY",
    });

  try {
    const manager = await Manager.findById(managerPk);
    if (!manager)
      return res.status(404).json({
        msg: "Manager 정보를 다시 확인 해주세요",
        code: "NOT_MANAGER",
      });

    req.manager = manager;
    return next();
  } catch (err) {
    return res.status(400).json({
      msg: "매니저 정보 조회중 에러 발생",
      code: "FAILED_MANAGER_INFO",
    });
  }
};

// 토큰 조회
const hasToken = async (req, res, next) => {
  const token = Auth.getToken(req.headers.authorization);

  // 토큰 없을시 다음 라우터로 이동
  if (!token) return next("route");
  req.token = token;
  return next();
};

// 클라이언트 상태 전송 (로그인 전)
const getClientStatusBeforeLogin = (req, res) => {
  const manager = req.manager;

  return res.status(200).json({
    status: "beforeLogin",
    totalCnt: manager.clients.length,
  });
};

// 클라이언트 상태 전송 (로그인 후)
const getClientStatusAfterLogin = (req, res) => {
  const manager = req.manager;
  const client = req.user;
  const count =
    manager.clients.findIndex(
      (standby) => String(standby.clientPk) === String(client._id)
    ) + 1;

  return res.status(200).json({
    status: "afterLogin",
    count: count,
    totalCnt: manager.clients.length,
  });
};

// 클라이언트 정보 조회
const getClient = async (req, res, next) => {
  const { clientPk, managerPk } = Auth.getTokenData(req.token);

  if (managerPk) req.managerPk = managerPk;
  if (!clientPk) return next("route");

  try {
    const client = await Client.findById(clientPk);

    if (!client) {
      let tokenObj = managerPk
        ? { accessToken: Auth.createToken({ managerPk }) }
        : {};
      return res.status(404).json({
        msg: "Client 정보를 다시 확인 해주세요",
        code: "NOT_CLIENT",
        ...tokenObj,
      });
    }
    req.user = client;
    return next();

    // 매니저 > 클라이언트 리스트
  } catch {
    return res.status(400).json({
      msg: "유저 정보 정보 조회중 에러 발생",
      code: "FAILED_CLIENT_INFO",
    });
  }
};

// 토큰내 클라이언트 PK와 스토어 관련 여부 확인
const isLinkManager = async (req, res, next) => {
  const manager = req.manager;
  const client = req.user;

  // 클라이언트 내 매니저 정보 확인
  const selectedManagerPk = client.managers.findIndex(
    (standby) => String(standby.managerPk) === String(manager._id)
  );

  if (selectedManagerPk === -1) return next("route");

  // 매니저 내 클라이언트 정보 확인
  const selectedClientPk = manager.clients.findIndex(
    (standby) => String(standby.clientPk) === String(client._id)
  );

  if (selectedClientPk === -1) return next("route");

  return next();
};

// 대기 등록 (로그인)
const login = async (req, res) => {
  // 매니저 로그인 정보
  const managerPkObj = req.managerPk ? { managerPk: req.managerPk } : {};
  const manager = req.manager;
  const { name, phone } = req.body;

  // 대기 등록 정보 SET
  const newStandby = {
    clientPk: null,
    managerPk: manager._id,
    name,
    phone,
    created: new Date(),
    status: "wait",
  };

  // 클라이언트 없을시 객체 생성
  if (!req.user) {
    const newClient = new Client({});
    req.user = await newClient.save();
  }

  const isLogged =
    req.user.managers.findIndex(
      (standby) => String(standby.managerPk) === String(manager._id)
    ) !== -1;

  // 같은 스토어에 로그인이 되어있는 경우
  if (isLogged) {
    const count =
      manager.clients.findIndex(
        (standby) => String(standby.clientPk) === String(req.user._id)
      ) + 1;
    return res.status(200).json({
      msg: "이미 로그인 되어있는 상태",
      accessToken: Auth.createToken({
        clientPk: String(req.user._id),
        ...managerPkObj,
      }),
      totalCnt: manager?.clients?.length ?? 0,
      count: count,
    });
  }

  newStandby.clientPk = req.user._id;
  req.user.managers.push(newStandby);
  manager.clients.push(newStandby);

  try {
    await Client.findByIdAndUpdate(req.user._id, req.user);
    await Manager.findByIdAndUpdate(manager._id, manager);

    return res.status(200).json({
      accessToken: Auth.createToken({
        clientPk: String(req.user._id),
        ...managerPkObj,
      }),
      totalCnt: manager?.clients?.length ?? 0,
      count: manager?.clients?.length ?? 0,
    });
  } catch {
    return res.status(400).json({
      msg: "대기열 등록 실패",
      code: "FAILED_ADD_STANDBYLIST",
    });
  }
};

// 대기 취소
const cancel = async (req, res) => {
  const manager = req.manager;
  const client = req.user;

  const selectedClientsIdx = manager.clients.findIndex(
    (standby) => String(standby.clientPk) === String(client._id)
  );

  if (selectedClientsIdx === -1)
    return res.status(404).json({
      msg: "대기열 정보 없음",
      code: "NOT_MANAGER_IN_CLIENTPK",
    });

  const selectedManagersIdx = client.managers.findIndex(
    (standby) => String(standby.managerPk) === String(manager._id)
  );

  if (selectedManagersIdx === -1)
    return res.status(404).json({
      msg: "대기열 정보 없음",
      code: "NOT_CLIENT_IN_MANAGERPK",
    });

  manager.clients.splice(selectedClientsIdx, 1);
  client.managers.splice(selectedManagersIdx, 1);

  await Manager.findByIdAndUpdate(manager._id, manager);
  await Client.findByIdAndUpdate(client._id, client);

  return res.status(200).json({
    msg: "대기열 삭제 성공",
    totalCnt: manager.clients.length ?? 0,
  });
};

export {
  getManagerInfo,
  hasToken,
  getClient,
  isLinkManager,
  getClientStatusBeforeLogin,
  getClientStatusAfterLogin,
  login,
  cancel,
};
