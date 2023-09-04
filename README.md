# Learn Express

---

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

---

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

---

### tj/n 사용시 버전 안바뀌는 오류

기존에 `node`가 이미 설치되어 있다면 `n`을 사용하여 버전을 바꿔도 `node` 버전이 바뀌지 않는다.

n으로 설치 시 installed와 active 경로가 다른데, 이를 링크로 연결해주면 된다.

```bash
$ sudo n
     copying : node/16.14.0
   installed : v16.14.0 to /usr/local/bin/node
      active : v18.17.0 at /home/codespace/nvm/current/bin/node
```

링크로 연결하기

```bash
ln -sf installed경로 active경로
```

결과

```bash
$ sudo n
     copying : node/16.14.0
   installed : v16.14.0 to /usr/local/bin/node
      active : v16.14.0 at /home/codespace/nvm/current/bin/node
```

---

### OpenSSL 사용
```bash
$ openssl req -nodes -new -x509 -keyout server.key -out server.cert 
```

주어진 명령어는 OpenSSL을 사용하여 자체 서명된 (self-signed) SSL/TLS 인증서와 개인 키를 생성하는 명령어입니다. 이렇게 생성된 인증서와 개인 키는 테스트나 개발 환경에서 보안 연결을 설정하는 데 사용될 수 있습니다.

여기서 사용된 명령어와 옵션들을 설명해보겠습니다:

- `openssl`: OpenSSL 명령어를 실행합니다.
- `req`: 인증서 요청(Certificate Request) 관련 명령어를 사용합니다.
- `-nodes`: 개인 키를 암호화하지 않은 상태로 생성합니다. 즉, 암호화하지 않은 개인 키를 생성합니다.
- `-new`: 새로운 CSR (Certificate Signing Request)을 생성합니다.
- `-x509`: 자체 서명된 인증서를 생성하고자 함을 나타냅니다.
- `-keyout server.key`: 생성한 개인 키를 `server.key` 파일로 저장합니다.
- `-out server.cert`: 생성한 자체 서명된 인증서를 `server.cert` 파일로 저장합니다.

이 명령어를 실행하면 OpenSSL은 다음과 같은 과정을 수행합니다:

1. 개인 키 생성: `-new`와 `-nodes` 옵션을 통해 암호화되지 않은 개인 키인 `server.key`를 생성합니다.
2. 자체 서명된 인증서 생성: `-x509` 옵션으로 인해 자체 서명된 인증서를 생성합니다. 이 인증서는 검증된 인증 기관(Certificate Authority)을 거치지 않고도 사용할 수 있는 것이지만, 실제 운영 환경에서는 보안상의 이유로 신뢰할 수 있는 인증 기관에 의해 발급된 인증서를 사용해야 합니다.
3. 파일 저장: `-keyout`와 `-out` 옵션을 사용하여 개인 키와 인증서를 각각 `server.key`와 `server.cert` 파일로 저장합니다.

이렇게 생성된 자체 서명된 인증서와 개인 키는 테스트 환경에서 보안 연결을 설정하거나 개발 과정에서 임시로 사용할 수 있습니다. 하지만 운영 환경에서는 더욱 강력한 보안을 위해 공인된 인증 기관에 의해 발급된 신뢰할 수 있는 인증서를 사용하는 것이 좋습니다.

---
### 502 Bad Gateway 에러 해결

[Check your server.keepAliveTimeout](https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/)

[Regression issue with keep alive connections](https://github.com/nodejs/node/issues/27363)

> HTTP keep-alive 연결은 클라이언트와 서버 간의 연결을 유지하고, 다수의 요청에 대해 하나의 연결을 사용하여 성능을 향상시킵니다. keepAliveTimeout은 HTTP keep-alive 연결이 유지되는 시간을 설정하는 속성이며, headersTimeout은 HTTP 요청 헤더를 수신하는 시간을 설정하는 속성입니다.

> headersTimeout이 keepAliveTimeout보다 크게 설정되어야 하는 이유는, HTTP 요청 헤더를 수신하는 시간이 keepAliveTimeout보다 길어질 수 있기 때문입니다. 만약 headersTimeout이 keepAliveTimeout보다 작게 설정되면, HTTP 요청 헤더를 수신하는 시간이 keepAliveTimeout보다 짧아질 수 있으며, 이 경우에는 HTTP keep-alive 연결이 끊어질 수 있습니다.

> keep-alive 연결은 HTTP Keep-Alive 헤더를 사용하여 관리됩니다. 이 헤더는 송신자가 연결에 대한 타임아웃과 요청 최대 개수를 어떻게 정했는지에 대해 알려줍니다2. 따라서 headersTimeout과 keepAliveTimeout의 설정은 keep-alive 연결의 유지에 영향을 미칠 수 있습니다.

> 따라서, headersTimeout은 keepAliveTimeout보다 크게 설정되어야 하며, 일반적으로 keepAliveTimeout의 1.5배 정도로 설정하는 것이 좋습니다.