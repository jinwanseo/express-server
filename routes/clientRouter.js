import { Router } from "express";

import * as clientController from "../controller/clientController.js";
const router = Router();

// 내 정보 조회
router.get("/my", [
  // 1. 스토어 정보 조회
  clientController.getManagerInfo,

  // 2. 토큰 조회
  clientController.hasToken,

  // 3. 클라이언트 조회
  clientController.getClient,

  // 4. 클라이언트 <-> 매니저 관련 여부 조회
  clientController.isLinkManager,

  // 5. 클라이언트 상태 전송 (로그인 후)
  clientController.getClientStatusAfterLogin,
]);
// 내 정보 조회 - 토큰 없을시 (로그인 하기 전)
router.get("/my", [
  // 클라이언트 상태 전송 (로그인 전)
  clientController.getClientStatusBeforeLogin,
]);

// 첫 페이지
router.get("/store", [
  // 1. 스토어 정보 조회
  clientController.getManagerInfo,
  // 2. 매니저 정보 리턴
  (req, res) =>
    res.status(200).json({
      manager: req.manager,
    }),
]);

// 대기 등록 (로그인)
router.post("/login", [
  // 1. 스토어 정보 조회
  clientController.getManagerInfo,
  // 2. 토큰 조회
  clientController.hasToken,
  // 3. 클라이언트 조회
  clientController.getClient,
  // 4. 대기등록 (로그인)
  clientController.login,
]);
// 대기 등록 - 토큰 없을시 (로그인 하기전)
router.post("/login", [clientController.login]);

// 대기 취소
router.delete("/cancel", [
  // 1. 스토어 정보 조회
  clientController.getManagerInfo,

  // 2. 토큰 조회
  clientController.hasToken,

  // 3. 클라이언트 조회
  clientController.getClient,

  // 4. 대기 취소
  clientController.cancel,
]);
// 대기 취소 - 토큰 없을시
router.delete("/cancel", (req, res) => {
  return res.status(404).json({
    msg: "토큰 정보 없음",
    code: "NOT_TOKEN",
  });
});

export default router;
