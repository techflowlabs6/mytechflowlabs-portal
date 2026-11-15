import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/contact.js";

// The handler must load as an ES module: this project is "type": "module"
// (like api/publish-apps.js), so a CommonJS `module.exports` here crashes
// the function on Vercel with FUNCTION_INVOCATION_FAILED. Importing it
// catches that at test time.

function mockRes() {
  const res = {
    _status: 0,
    _body: "",
    status(code) {
      this._status = code;
      return this;
    },
    setHeader() {
      return this;
    },
    end(body) {
      this._body = body;
    },
  };
  return res;
}

async function call(req) {
  const res = mockRes();
  await handler(req, res);
  return { status: res._status, body: JSON.parse(res._body || "{}") };
}

test("contact endpoint rejects non-POST with 405", async () => {
  const { status, body } = await call({ method: "GET", body: {} });
  assert.equal(status, 405);
  assert.match(body.error, /POST/);
});

test("contact endpoint requires a message for message/request kinds", async () => {
  const { status } = await call({
    method: "POST",
    body: { kind: "message", name: "Naveen" },
  });
  assert.equal(status, 400);
});

test("contact endpoint validates the subscribe email", async () => {
  const { status } = await call({
    method: "POST",
    body: { kind: "subscribe", email: "not-an-email" },
  });
  assert.equal(status, 400);
});

test("contact endpoint answers 501 with setup instructions when unconfigured", async () => {
  const { status, body } = await call({
    method: "POST",
    body: { kind: "message", name: "Naveen", message: "Hello" },
  });
  assert.equal(status, 501);
  assert.equal(body.code, "contact_not_configured");
  const subscribed = await call({
    method: "POST",
    body: { kind: "subscribe", email: "a@b.com" },
  });
  assert.equal(subscribed.status, 501);
});
