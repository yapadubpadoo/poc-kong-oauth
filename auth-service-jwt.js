const jwt = require('jsonwebtoken');

// openssl rsa -in private.pem -outform PEM -pubout -out public.pem
// openssl genrsa -out private.pem 2048

const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA1v3rwj8bX0AsP41oWxorxmayIElBUzbXgR7n71fysOzTcuq5
CfokGC3HO+H2QN9STdMjZaT2Y5gDk4KKnWRMPB3eBNeEE1sVCD3bCY4lhuEoQWCy
0uEv3rioYJcSfs7lU0q4RzoMnbdtzIC1KlDNxJq4vV3DRW59AJVgpn9Ue0d0E2dy
s4kmCiY5GHKzsapX+R5+/L8X+JpYo1qVLLuNgyxzGwGxm9cbocvdmSMLuXG96jUQ
ZRAIYVvZw33QfI4H0QsN/jZyy5vWparCJkPVVneEcgLLyLsRGSFVx8je1riGJnYd
XyozE8pKAhl3Fdezy3Jhw2FS1LMV2XGkDFxdGwIDAQABAoIBADbfUkgewUa7Y0/J
MMRn1ppp5bbV26V4juJ21+2/vcKof4OKIzZHsOS28m33S1ndZe1VIWi1BOoAh5Ej
tWtciRSi7uK/ewdRrPmQiBJVRIC7gQHGw32NWiF3cgpNJLxW5DMxE/2h9Exg39Zd
V1/4hbxTXSl///H9tEvs1GFKiG56I0rHM2zcjvF8+lMhQa6tN+eZucC9Ka8AHBLT
pQyn/SWEa+b76+nSFwVHAoy22ipZ0GhKNZykLAMFEiveX1072ezY8zXthX1NdOIH
nXGB8yTEB/2CpBkUuY4zxc0WEPnYnnWcMf+Ibgd1Gt3O1sUXDb98Kaz1hpgvWOb6
1vzaniECgYEA+ZZjbhMoVQyRvFqEdXfQZaAaMJEBrxPWx2jYvMr0FKOJMp7TmbHK
c3xrcMyIHFvjiVhsd46SN3ay1qEWlbECSUSGxnqELYzWjjiO4F+m9XKSO/8KmlX/
YgV53hbsm2DUOj9dwEEMY0c5S122igiaJUmCqSrgUsHouIllfj4y6LECgYEA3IP8
rx5lgKfvzCAOCJmFnARrLa1eBmfxW4aTS1xcW7nTn5D7UHf79kFKsfMa/Yy5fY41
SrHi3MJsU5tcydKVK2ZZVXGIrneNMFBjzmnkOt13DDebzif8+pc88o7uoMoO1q5p
h68TNltfHK+3Yho0xjkuAiHnzt+gy77jJawZlYsCgYB12GxaLPF+NtEY/iRM0qWz
VkUHaXBCGjvvK7IqcimNFSpSnGuMxkWxAa45NFmQClMFJpsQWGDxjzoh3S2swEc0
EQcR8Ac4+qbTwCC2EHPksJQbf/ChrrlGrw87rddKBg4u8nxxqkUPGzISQ81Mn4Mo
1+y5s2T3rlcTyswBL50aAQKBgFDjeYUjOUiAUc4m0/8DkacxV79hoOPorPhN3Sn/
r0FWYPJfVFCoMpyaRrQP4Q6w2DneOF418mnYR7RDgT3nKSDKYmqdQu38nKXkVzgY
T8foBQtOOrDcqkehwpGXLKF+fQLy53MGHZ4K1lDHhBVQV5t+zgmqNkYEcg9K7jeb
cacRAoGAK09oRgEmQyuhIseZ4wyKGlU+8sW18qxYE56P0zBWrdqoMSnwFOrV+MUw
hsu9AJ1TgPJJdgxU26kG9J7epn7igaaD4EYkwdtNEJ9iaKNZnc6dH2se5QcnY7Ej
Is0aW5JLwW2VEmv7xyT6gIjZ2TgIWq1QuFZcmhWZCNaPkmoAKQI=
-----END RSA PRIVATE KEY-----`

const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1v3rwj8bX0AsP41oWxor
xmayIElBUzbXgR7n71fysOzTcuq5CfokGC3HO+H2QN9STdMjZaT2Y5gDk4KKnWRM
PB3eBNeEE1sVCD3bCY4lhuEoQWCy0uEv3rioYJcSfs7lU0q4RzoMnbdtzIC1KlDN
xJq4vV3DRW59AJVgpn9Ue0d0E2dys4kmCiY5GHKzsapX+R5+/L8X+JpYo1qVLLuN
gyxzGwGxm9cbocvdmSMLuXG96jUQZRAIYVvZw33QfI4H0QsN/jZyy5vWparCJkPV
VneEcgLLyLsRGSFVx8je1riGJnYdXyozE8pKAhl3Fdezy3Jhw2FS1LMV2XGkDFxd
GwIDAQAB
-----END PUBLIC KEY-----
`


class AuthService {
    constructor(privateKey, publicKey) {
        this.tokenHeaders = {
            kid: '801c8879808b071c4992f607308d955f',
            typ: "JWT"
        }
        this.iss = 'user-service'
        this.privateKey = privateKey
        this.publicKey = publicKey
    }

    issueToken(payload) {
        return jwt.sign(JSON.stringify({ ...payload, iss: this.iss }), privateKey, { algorithm: 'RS256', header: this.tokenHeaders })
    }

    authenticate(token) {
        return jwt.verify(token, publicKey, { algorithm: 'RS256' })
    }
}

const authService = new AuthService(privateKey, publicKey)

const userToken = authService.issueToken({ user: 1 })
console.log(userToken)

console.log(authService.authenticate(userToken))