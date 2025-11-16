# 회사 인증서 및 프록시 설정

## 프록시 설정
- **프록시 스크립트 주소**: http://pac.score/score.pac
- **프록시 서버**: 30.30.30.27:8080

## 인증서
- **파일명**: new_S-Core.Proxy.crt
- **발급 기관**: S-Core Co., Ltd.
- **유효 기간**: 2021-03-30 ~ 2040-12-15
- **용도**: 회사 프록시 서버 SSL 인증

## 사용 방법
이 인증서는 회사 프록시를 통해 HTTPS 연결 시 필요합니다.

### Node.js 환경에서 사용
```bash
export NODE_EXTRA_CA_CERTS=.certs/new_S-Core.Proxy.crt
```

### Git 설정
```bash
git config --global http.sslCAInfo "$(pwd)/.certs/new_S-Core.Proxy.crt"
git config --global http.proxy "http://30.30.30.27:8080"
git config --global https.proxy "http://30.30.30.27:8080"
```

## 주의사항
- 이 폴더는 Git에서 추적되지 않습니다 (`.gitignore`에 포함됨)
- 회사 보안 정책에 따라 인증서를 관리하세요
