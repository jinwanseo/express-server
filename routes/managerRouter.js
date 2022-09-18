import { Router } from "express";
import * as managerController from "../controller/managerController.js";

const router = Router();

// 아이디 중복체크
router.get("/check/id", [
  // 아이디 중복 체크
  managerController.checkId,
]);

// 회원가입
router.post("/register", [
  // 회원 가입
  managerController.createManager,
]);

// 회원 정보 변경
router.put("/register", [
  // 토큰 유무
  // 토큰 조회
  // 유저 조회
  // 정보 변경
]);

// 로그인
router.post("/login", [
  // 로그인
  managerController.loginManager,
]);

// 내 정보 조회
router.get("/my", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 유저 정보 전송
  managerController.resManager,
]);

// 대기 현황
router.get("/standby", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 대기 현황 정보 전송
]);

// 호출
router.put("/call", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 호출 처리
]);

// 입장
router.put("/enter", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 입장 처리
]);

// 대기 취소
router.put("/cancel", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 대기 취소 처리
]);

// 캐시 삭제
router.delete("/cache/clients", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 캐시 삭제 처리
]);

// 비번 확인
router.post("/check/pw", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 비번 확인
]);

// 비번 변경
router.put("/change/pw", [
  // 토큰 유무
  managerController.hasToken,
  // 토큰 조회
  managerController.checkToken,
  // 유저 조회
  managerController.checkManager,
  // 비번 확인
  // 비번 변경
]);

// 토큰 삭제
router.delete(`/token/remove`, [
  // // 1. 토큰 유무
  // managerController.hasToken,
  // // 2. 토큰 조회
  // managerController.checkToken,
  // // 3. 토큰 삭제
  // managerController.removeToken,
]);

export default router;
