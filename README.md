# Banco API Performance

Projeto de testes de performance de uma API bancária, desenvolvido em JavaScript com [Grafana k6](https://grafana.com/docs/k6/latest/). Os cenários simulam requisições de autenticação e transferência, permitindo observar o comportamento da API e validar critérios básicos de desempenho e resposta.

## Tecnologias utilizadas

- **JavaScript (ES modules):** implementação dos cenários e funções reutilizáveis.
- **Grafana k6:** execução dos testes, geração de métricas, verificações (`check`) e critérios de desempenho (`thresholds`).
- **JSON:** armazenamento de configurações locais e dados de autenticação.
- **Git e GitHub:** versionamento e hospedagem do código.

> O projeto não possui `package.json` nem dependências npm. A execução dos testes é feita diretamente pelo k6.

## Estrutura do repositório

```text
banco-api-performance/
├── config/
│   └── config.local.json
├── fixtures/
│   └── postLogin.json
├── helpers/
│   └── autenticacao.js
├── tests/
│   ├── login.test.js
│   └── transferencias.test.js
├── utils/
│   └── variaveis.js
├── .gitignore
└── README.md
```

## Objetivo de cada grupo de arquivos

### `config/`

Contém configurações locais do projeto. Atualmente, `config.local.json` define `baseUrl` com o endereço `http://localhost:3000`, utilizado como valor padrão quando a variável de ambiente `BASE_URL` não é informada.

### `fixtures/`

Armazena dados de entrada utilizados pelos testes. O arquivo `postLogin.json` contém os dados enviados na requisição de login.

**Atenção:** o fixture atual contém credenciais. Utilize somente credenciais de teste e evite versionar senhas ou outros segredos reais. Se alguma credencial válida já tiver sido publicada no repositório, troque-a.

### `helpers/`

Reúne funções reutilizáveis pelos cenários. `autenticacao.js` implementa `gerarToken()`: realiza uma requisição `POST` para `/login`, utilizando os dados do fixture, e retorna o token da resposta. Essa função é utilizada pelo teste de transferências.

### `tests/`

Contém os cenários executáveis pelo k6:

- **`login.test.js`:** envia requisições `POST` para `/login`, verifica se a resposta possui status HTTP 200 e se o token foi retornado como string. Define uma carga por estágios: 10 usuários virtuais, depois 30, e redução gradual até zero. Também configura os seguintes thresholds:
  - `http_req_duration`: percentil 95 abaixo de 3.000 ms e máximo abaixo de 5.000 ms.
  - `http_req_failed`: taxa de falhas abaixo de 1%.
- **`transferencias.test.js`:** obtém um token por meio do helper de autenticação e envia uma requisição `POST` para `/transferencias`. Verifica o status HTTP 201 e a mensagem de sucesso. O cenário está configurado para executar uma iteração.

### `utils/`

Contém funções utilitárias compartilhadas. `variaveis.js` exporta `pegarBaseURL()`, que prioriza o valor da variável de ambiente `BASE_URL`. Caso ela não seja informada, utiliza o endereço `baseUrl` definido em `config/config.local.json`.

### `.gitignore`

Ignora o arquivo `html-report.html`, gerado na exportação do relatório do dashboard do k6, para evitar que esse artefato seja incluído no versionamento.

## Instalação e execução do projeto

### Pré-requisitos

- Git instalado.
- Grafana k6 instalado e disponível no terminal.
- API bancária em execução e acessível no endereço que será informado em `BASE_URL`.
- Dados de teste válidos para autenticação e contas disponíveis para o cenário de transferência.

Consulte a documentação oficial para instalar o k6 no seu sistema operacional:

https://grafana.com/docs/k6/latest/set-up/install-k6/

### Clonar o repositório

```bash
git clone https://github.com/adelsonmjunior/banco-api-performance.git
cd banco-api-performance
```

### Configurar a URL da API

Os scripts obtêm a URL base por meio da função `pegarBaseURL()`, em `utils/variaveis.js`.

A precedência é:

1. Valor passado pela variável de ambiente `BASE_URL`.
2. Valor padrão `http://localhost:3000`, definido em `config/config.local.json`.

Assim, para executar os testes em outro ambiente, informe `BASE_URL` no comando do k6 com `-e`:

```bash
k6 run -e BASE_URL=https://sua-api.com tests/login.test.js
```

Substitua `https://sua-api.com` pela URL base da API que será testada. Não acrescente `/login` ou `/transferencias` ao valor: os próprios scripts acrescentam esses caminhos.

### Executar o teste de login

```bash
k6 run -e BASE_URL=https://sua-api.com tests/login.test.js
```

Esse cenário executa o teste de login com os estágios de usuários virtuais e thresholds definidos no arquivo.

### Executar o teste de transferências

```bash
k6 run -e BASE_URL=https://sua-api.com tests/transferencias.test.js
```

Esse cenário realiza uma iteração, autentica para obter o token e executa uma transferência conforme os dados definidos no script.

### Acompanhar a execução em tempo real e exportar o relatório HTML

O k6 oferece um dashboard web para acompanhar as métricas durante a execução. As variáveis de ambiente abaixo habilitam o dashboard e definem a exportação do relatório HTML:

- `K6_WEB_DASHBOARD=true`: habilita o dashboard web.
- `K6_WEB_DASHBOARD_EXPORT=html-report.html`: define o nome do arquivo HTML exportado ao final da execução.

**Linux / macOS**

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run -e BASE_URL=https://sua-api.com tests/login.test.js
```

**Windows PowerShell**

```powershell
$env:K6_WEB_DASHBOARD = "true"
$env:K6_WEB_DASHBOARD_EXPORT = "html-report.html"

k6 run -e BASE_URL=https://sua-api.com tests/login.test.js
```

Durante a execução, acesse o dashboard pelo navegador:

http://localhost:5665

Ao término do teste, o k6 exporta o relatório para `html-report.html` no diretório de execução. Abra esse arquivo em um navegador para consultar os resultados.

Para executar o cenário de transferências com dashboard e exportação, substitua `tests/login.test.js` por `tests/transferencias.test.js` no comando.

> **Observação:** o dashboard apresenta métricas durante a execução; o arquivo HTML é exportado ao final do teste. O arquivo `html-report.html` está listado no `.gitignore` e, portanto, não deve ser versionado.

## Observações

- Confirme que a API está disponível e que os dados de autenticação e as contas utilizadas nos testes são válidos antes de executar os cenários.
- Execute testes de carga somente em ambientes autorizados, preferencialmente dedicados a testes.
- Os cenários e thresholds descritos neste README refletem a implementação presente nos arquivos do repositório.
