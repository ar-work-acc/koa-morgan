import Koa, { Context } from "koa"
import bodyParser from "koa-bodyparser"
import Router from "@koa/router"
import { morgan, MorganOptions } from "../index"

export const AppFactory = (
  format: string,
  options: MorganOptions = {
    logger: console.log,
    colored: true,
  }
) => {
  const app = new Koa()

  // use our morgan logger:
  app.use(morgan(format, options))

  app.use(bodyParser())

  const router = new Router()
  router.get("/200", (ctx: Context) => {
    // ctx.router available
    ctx.res.setHeader("X-Keys", ["foo", "bar"])
    ctx.body = {
      message: "hello",
    }
  })

  router.get("/301", (ctx: Context) => {
    ctx.status = 301
  })
  router.get("/404", (ctx: Context) => {
    ctx.status = 404
  })
  router.get("/500", (ctx: Context) => {
    ctx.status = 500
  })
  router.get("/error", (ctx: Context) => {
    throw new Error("boom")
  })

  app.use(router.routes()).use(router.allowedMethods())

  return app
}
