import jsdom from "jsdom-global";
// import "isomorphic-unfetch";
import fetch,  { Headers, Request, Response, FetchError } from 'node-fetch';
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.FetchError = FetchError;
global.Headers = Headers;

jsdom("<div id='app'></div>", { url: "http://localhost/" });

let storage = {};
global.localStorage = {
  setItem(key, value) {
    storage[key] = value;
  },
  getItem(key) {
    return storage[key] || null;
  },
  clear() {
    storage = {};
  }
};

function beforeEach() {
  document.body.innerHTML = "<div id='app'></div>";
  global.localStorage.clear();
}

export default {beforeEach};