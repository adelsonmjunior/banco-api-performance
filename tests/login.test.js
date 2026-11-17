import http from "k6/http"
import { sleep, check } from "k6"
const postLogin = JSON.parse(open("../fixtures/postLogin.json"))
import { pegarBaseURL } from "../utils/variaveis.js"

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "20s", target: 10 },
    { duration: "10s", target: 30 },
    { duration: "20s", target: 30 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000", "max<5000"],
    http_req_failed: ["rate<0.01"],
  },
}

export default function () {
  const url = `${pegarBaseURL()}/login`
  const payload = JSON.stringify(postLogin)

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  const res = http.post(url, payload, params)
  check(res, {
    "Validar que o status seja 200": (r) => r.status === 200,
    "Validar que o token seja retornado": (r) => r.json("token") !== undefined,
    "Validar que o token seja uma string": (r) =>
      typeof r.json("token") === "string",
  })

  sleep(1)
}
