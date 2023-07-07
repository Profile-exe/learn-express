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
```

> 특정 포트 죽이기
```bash
fuser -k -n tcp 포트번호
```

[[Linux] 사용 중인 포트 종료하기](https://navydoc.tistory.com/31)