

// // 앞단으로부터 사용자 정보 받아서 토큰을 얻어내고 디비에 저장
//
// // 인증한 후에도 다시 인증을 하는 경우
//
// // 인증을 정지하는 경우
//
// // 인증을 아예 해제하는 경우
//
// // 해제하고 다시 인증하는 경우
//
// // 리프레쉬하는 경우
//
// // 위 상황에 대한 모든 에러처리
//
'use strict';

/**
 * @file box_auth - router
 * @author hangbok
 *
 * @description This file is router to authenticate user's box drive
 *
 */

module.exports = function() {

  const crypto = require('crypto');
  const url = require('url');
  const app = require('express')();


  function generateRedirectURI(req) {
    return url.format({
      protocol: req.protocol,
      host: req.headers.host,
      pathname: app.path() + '/box/callback'
    });
  }

  function generateCSRFToken() {
    return crypto.randomBytes(18).toString('base64')
      .replace('///g', '-').replace('/+/g', '_');
  }

  return {
    generateRedirectURI: generateRedirectURI,
    generateCSRFToken: generateCSRFToken
  };
}
