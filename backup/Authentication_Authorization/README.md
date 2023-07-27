# Learn Express

___

## [Udemy Node.js 강의](https://www.udemy.com/course/nodejs-mvc-rest-apis-graphql-deno/)

```
npm install
```

```
npm start
```

`backup` 폴더에는 중요하다고 생각한 챕터마다 소스코드 저장
```
backup/
├── Use_mongoose
└── Use_sequelize
```

___

### 리눅스에서 특정 포트 죽이기

> 특정 포트 열려있는지 확인
```bash
netstat -nap | grep :포트번호

# 예시
netstat -nap | grep :3000
```

> 특정 포트 죽이기
```bash
fuser -k -n tcp 포트번호

# 예시
fuser -k -n tcp 3000
```

[[Linux] 사용 중인 포트 종료하기](https://navydoc.tistory.com/31)

___

### 502 Bad Gateway 에러 해결

[Check your server.keepAliveTimeout](https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/)

[Regression issue with keep alive connections](https://github.com/nodejs/node/issues/27363)

> HTTP keep-alive 연결은 클라이언트와 서버 간의 연결을 유지하고, 다수의 요청에 대해 하나의 연결을 사용하여 성능을 향상시킵니다. keepAliveTimeout은 HTTP keep-alive 연결이 유지되는 시간을 설정하는 속성이며, headersTimeout은 HTTP 요청 헤더를 수신하는 시간을 설정하는 속성입니다.

> headersTimeout이 keepAliveTimeout보다 크게 설정되어야 하는 이유는, HTTP 요청 헤더를 수신하는 시간이 keepAliveTimeout보다 길어질 수 있기 때문입니다. 만약 headersTimeout이 keepAliveTimeout보다 작게 설정되면, HTTP 요청 헤더를 수신하는 시간이 keepAliveTimeout보다 짧아질 수 있으며, 이 경우에는 HTTP keep-alive 연결이 끊어질 수 있습니다.

> keep-alive 연결은 HTTP Keep-Alive 헤더를 사용하여 관리됩니다. 이 헤더는 송신자가 연결에 대한 타임아웃과 요청 최대 개수를 어떻게 정했는지에 대해 알려줍니다2. 따라서 headersTimeout과 keepAliveTimeout의 설정은 keep-alive 연결의 유지에 영향을 미칠 수 있습니다.

> 따라서, headersTimeout은 keepAliveTimeout보다 크게 설정되어야 하며, 일반적으로 keepAliveTimeout의 1.5배 정도로 설정하는 것이 좋습니다.

