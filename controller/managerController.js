import Manager from "../models/manager.js";
import Client from "../models/client.js";

import * as Auth from "../utils/auth.js";

// 아이디 중복 체크
const checkId = async (req, res) => {
  const { userId } = req.query;
  // 유저 아이디 검사
  if (!userId || userId.length < 5)
    return res.status(404).json({
      message: "아이디는 5글자 이상 15글자 미만",
      code: "FAILED_USERID",
    });

  const selectedManager = await Manager.findOne({ userId: userId });
  if (selectedManager)
    return res.status(404).json({
      message: "이미 사용중인 아이디 입니다",
      code: "FAILD_USERID",
    });

  return res.status(200).json({
    message: "사용 가능한 아이디",
    code: "OK",
  });
};

// 회원 가입 [Yup 추가 필요 🚀]
const createManager = async (req, res, next) => {
  const {
    userId,
    userPw,
    name,
    phone,
    storeName,
    storeAddress,
    storeNumber,
    blogUrl,
  } = req.body;

  const newManager = new Manager({
    userId,
    userPw: Auth.createPw(userPw),
    name,
    phone,
    storeName,
    storeAddress,
    storeNumber,
    blogUrl,
  });

  try {
    const manager = await newManager.save();

    return res.status(200).json({
      message: "회원 가입을 축하합니다🎉 로그인 해주세요",
      manager: manager,
    });
  } catch (err) {
    console.log(`Manager 회원 가입 도중 에러 발생`, err);
    return res.status(400).json({
      message: "Manager 회원 가입 도중 에러 발생",
      code: "FAILED_REGISTER",
    });
  }
};

// 로그인 [Yup 추가 필요 🚀]
const loginManager = async (req, res, next) => {
  const { userId, userPw } = req.body;
  try {
    const manager = await Manager.findOne({ userId });
    // 아이디, 비밀번호 다를시
    if (!manager || !Auth.comparePw(manager.userPw, userPw))
      return res.status(400).json({
        message: "아이디 또는 비밀번호 확인",
        code: "FAILED_LOGIN",
      });

    // 토큰 생성
    const clientPkObj = req.clientPk ? { clientPk: req.clientPk } : {};

    const accessToken = Auth.createToken({
      managerPk: String(manager._id),
      ...clientPkObj,
    });

    return res.status(200).json({
      message: "로그인 성공",
      accessToken: accessToken,
    });
  } catch (err) {
    // 로그인 도중 발생 에러
    console.log(`로그인시 발생 에러`, err);
    return res.status(400).json({
      message: "아이디 또는 비밀번호 확인",
      code: "FAILED_LOGIN",
    });
  }
};

// 토큰 유무 조회
const hasToken = (req, res, next) => {
  const token = Auth.getToken(req.headers.authorization);
  // 토큰 없을시
  if (!token) {
    return res.status(404).json({
      message: "토큰 없음, 로그인 필요",
      code: "NOT_TOKEN",
    });
  }
  req.token = token;
  return next();
};

// 토큰 정보 검사
const checkToken = (req, res, next) => {
  // 토큰 데이터 검사
  const { clientPk, managerPk, errData } = Auth.getTokenData(req.token);
  // 토큰 데이터 (파싱) 에러시
  if (errData)
    return res.status(401).json({
      ...errData,
    });

  // 토큰 내 정보 저장
  req.clientPk = clientPk;
  req.managerPk = managerPk;

  // 로그인 안된 경우
  if (!managerPk) {
    return res.status(404).json({
      message: "로그인 필요",
      code: "NOT_MANAGERPK_TOKEN",
    });
  }

  return next();
};

// 유저 조회
const checkManager = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.managerPk);
    if (!manager)
      return res.status(404).json({
        message: "매니저 정보 조회 도중 에러 발생",
        code: "FAILED_CHECK_MANAGER",
      });

    req.manager = manager;
    next();
  } catch (err) {
    return res.status(404).json({
      message: "매니저 정보 조회 도중 에러 발생",
      code: "FAILED_CHECK_MANAGER",
    });
  }
};

// 유저 정보 전송
const resManager = async (req, res, next) => {
  return res.status(200).json({
    manager: req.manager,
  });
};

export {
  checkId,
  createManager,
  loginManager,
  hasToken,
  checkToken,
  checkManager,
  resManager,
};
