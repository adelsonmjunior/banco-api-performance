const __ENV = JSON.parse(open("../config/config.local.js"))
export function pegarBaseURL() {
    return __ENV.BASE_URL || config.local.BASE_URL
}