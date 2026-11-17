import http from "k6/http"
import { sleep, check } from "k6"
import { gerarToken } from "../helpers/autenticacao.js"

export const options = {
  iterations: 1,
}

export default function () {
  const token = gerarToken()
  const url = "http://localhost:3000/transferencias"

  const payload = JSON.stringify({
    contaOrigem: 1,
    contaDestino: 2,
    valor: 20,
    token: "" + token,
  })

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }

  const res = http.post(url, payload, params)
  check(res, {
    "Validar que o status seja 201": (r) => r.status === 201,
    "Validar que a transferência foi realizada com sucesso": (r) =>
      r.json("message") === "Transferência realizada com sucesso.",
  })

  sleep(1)
}
