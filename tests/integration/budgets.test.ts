import { afterEach, beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import { Budget } from "../../src/models/budget"
import { IncomingMessage, Server, ServerResponse } from "http"

let server: Server<typeof IncomingMessage, typeof ServerResponse>

describe("/api/budgets", () => {
  beforeEach(async () => {
    server = (await import("../../src/index.js")).default
  })

  afterEach(async () => {
    await Budget.clear()
    server.close()
  })

  describe("GET /", () => {
    it("should return all budgets", async () => {
      await Budget.createMany([
        { name: "budget1", userId: "user1" },
        { name: "budget2", userId: "user2" },
      ])

      const res = await request(server).get("/api/budgets")

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(2)

      expect(res.body[0]).not.toHaveProperty("userId", "user1")
      expect(res.body[1]).not.toHaveProperty("userId", "user2")

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "budget1" }),
          expect.objectContaining({ name: "budget2" }),
        ])
      )
    })
  })

  describe("GET /:id", () => {
    it("should return 404 if budget with ID was not found", async () => {
      await Budget.create({ name: "budget1", userId: "user1" })

      const res = await request(server).get("/api/budgets/" + "noexisting")

      expect(res.status).toBe(404)
    })

    it("should return a single budget", async () => {
      const budget = await Budget.create({ name: "budget1", userId: "user1" })

      const res = await request(server).get("/api/budgets/" + budget.id)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("name", "budget1")
    })
  })
})
