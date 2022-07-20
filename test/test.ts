import { AppFactory } from "./test-server"
import supertest from "supertest"
import { logging } from "./logger"
import { Context } from "koa"
const logger = logging("jest")

/**
 * convert a RegExp to a string for later concatenation
 * @param regexp
 * @returns
 */
const regexpToString = (regexp: RegExp) => {
  const regexpString = regexp.toString()
  return regexpString.substring(1, regexpString.length - 1)
}

describe("test koa-morgan logging middleware", () => {
  // beforeEach(async () => {
  // })

  // afterEach(async () => {
  // })

  test("test 200 default format", async () => {
    const mockLogger = jest.fn().mockName("200-default")
    const app = AppFactory("dev", {
      logger: mockLogger,
      colored: true,
    })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect(200).expect({ message: "hello" })

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/200 \x1b\[32m200\x1b\[0m \d+ ms - \d+$/)
    )

    server.close()
  })

  test("test 301 default format", async () => {
    const mockLogger = jest.fn().mockName("301-default")
    const app = AppFactory("dev", {
      logger: mockLogger,
      colored: true,
    })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/301").expect(301)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/301 \x1b\[36m301\x1b\[0m \d+ ms - \d+$/)
    )

    server.close()
  })

  test("test 404 default format", async () => {
    const mockLogger = jest.fn().mockName("404-default")
    const app = AppFactory("dev", {
      logger: mockLogger,
      colored: true,
    })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/404").expect(404)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/404 \x1b\[33m404\x1b\[0m \d+ ms - \d+/)
    )

    server.close()
  })

  test("test 500 default format", async () => {
    const mockLogger = jest.fn().mockName("500-default")
    const app = AppFactory("dev", {
      logger: mockLogger,
      colored: true,
    })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/500").expect(500)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/500 \x1b\[31m500\x1b\[0m \d+ ms - \d+$/)
    )

    server.close()
  })

  test("test token :date", async () => {
    const mockLogger = jest.fn().mockName("token-date")
    const app = AppFactory(
      ":method :url :status :response-time ms :res[content-type] :date[clf] :date[iso] :date",
      { logger: mockLogger, colored: true }
    )
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    const isoFormatString = regexpToString(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
    )
    const clfFormatString = regexpToString(
      /\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2} \+0000/
    )
    const utcFormatString = regexpToString(
      /(Mon|Tue|...|Sun)\,\s\d{2}\s(Jan|Feb|...|Dec)\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT/
    )
    expect(mockLogger.mock.calls[0][0]).toMatch(
      new RegExp(
        `^GET /200 \\x1b\\[32m200\\x1b\\[0m \\d+ ms application/json; charset=utf-8` +
          " " +
          clfFormatString +
          " " +
          isoFormatString +
          " " +
          utcFormatString +
          "$"
      )
    )

    server.close()
  })

  test("test token :http-version", async () => {
    const mockLogger = jest.fn().mockName("token-http-version")
    const app = AppFactory(":http-version", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{1}\.\d{1}$/)
    )

    server.close()
  })

  test("test token :referrer", async () => {
    const mockLogger = jest.fn().mockName("token-referrer")
    const app = AppFactory(":referrer", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").set("Referer", "http://localhost/").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith("http://localhost/")

    server.close()
  })

  test("test token :remote-addr", async () => {
    const mockLogger = jest.fn().mockName("remote-addr")
    const app = AppFactory(":remote-addr", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(expect.stringMatching(/127.0.0.1$/))

    server.close()
  })

  test("test token :remote-user", async () => {
    const mockLogger = jest.fn().mockName("remote-user")
    const app = AppFactory(":remote-user", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent
      .get("/200")
      .set("Authorization", "Basic YXJ3b3JrYWNjOg==")
      .expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith("arworkacc")

    server.close()
  })

  test("test token :req", async () => {
    const mockLogger = jest.fn().mockName("req")
    const app = AppFactory(":req[x-from-string] :req[does-not-exist]", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").set("x-from-string", "me").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith("me -")

    server.close()
  })

  test("test token :req (array)", async () => {
    const mockLogger = jest.fn().mockName("req array")
    const app = AppFactory(":req[set-cookie]", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent
      .get("/200")
      .set({ "Set-Cookie": ["foo=bar", "fizz=buzz"] })
      .expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith("foo=bar, fizz=buzz")

    server.close()
  })

  test("test token :res (array)", async () => {
    const mockLogger = jest.fn().mockName("res array")
    const app = AppFactory(":res[X-Keys] :res[does-not-exist]", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect("X-Keys", "foo, bar").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith("foo, bar -")

    server.close()
  })

  test("test token :user-agent", async () => {
    const mockLogger = jest.fn().mockName("user-agent")
    const app = AppFactory(":user-agent", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").set("User-Agent", "my-ua").expect(200)

    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith("my-ua")

    server.close()
  })

  test("test predefined format: default", async () => {
    const mockLogger = jest.fn().mockName("predefined-formats: default")
    const app = AppFactory("default", { logger: mockLogger })
    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect(200)

    // logger.debug(mockLogger.mock.lastCall[0])
    expect(mockLogger).toHaveBeenCalled()
    expect(mockLogger).toBeCalledTimes(1)
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringMatching(
        /^::ffff:127.0.0.1 - undefined \[\d{1,2}\/\w{3}\/20\d{2}:\d{2}:\d{2}:\d{2} \+0000\] "GET \/200 HTTP\/1.1" 200 \d+ "undefined" "undefined"$/
      )
    )

    server.close()
  })

  test("test skip option", async () => {
    const mockLogger = jest.fn().mockName("morgan options: skip")
    const app = AppFactory("default", {
      logger: mockLogger,
      skip: (ctx: Context) => {
        return ctx.status < 400
      },
    })

    const server = app.listen()
    const agent = supertest.agent(server)

    await agent.get("/200").expect(200)
    expect(mockLogger).toHaveBeenCalledTimes(0)

    await agent.get("/404").expect(404)
    expect(mockLogger).toHaveBeenCalledTimes(1)

    await agent.get("/500").expect(500)
    expect(mockLogger).toHaveBeenCalledTimes(2)

    server.close()
  })
})
