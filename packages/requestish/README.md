# requestish

Taking a “Zaphod’s just this guy, you know?” approach to web requests

[![npm version](https://badge.fury.io/js/requestish.svg)](https://badge.fury.io/js/requestish)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://nodejs.org/api/esm.html)

## Motivation

This was developed as a sub-package of [oauth2-cli](https://www.npmjs.com/package/oauth2-cli) to facilitate swapping between [openid-client](https://www.npmjs.com/package/openid-client) and [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) requests. It is not full-featured, but has the appearance of a package that may eventually become useful.

And, in the meantime, I can specify parameters that are `URL.ish` or `Headers.ish`, to my amusement.

## Install

```bash
npm install --save requestish
```

## Usage

### For sane people

```ts
import * as requestish from 'requestish';

// it could be a string...
let url: requestish.URL.ish = 'https://example.com';

// ...or it could be an object...
url = new URL('https://example.com');

// ...we just don't care.
console.log(requestish.URL.toString(url));
```

### For people who like to giggle

```ts
import { URL } from 'requestish';

// it could be a string...
let url: URL.ish = 'https://example.com';

// ...or it could be an object...

url = URL.from('https://example.com');

// ...we just don't care.
console.log(URL.toString(url));
```

## Components

### `Url`

`URL.ish` could be a URL or a string.

`URL.from()` takes that `URL.ish` and gives you a `URL` object.

`URL.toString()` takes that `URL.ish` and gives a string.

### `URLSearchParams`

`URLSearchParams.ish` could be a URLSearchParams object or an associative array of strings (`Record<string,string>`).

`URLSearchParams.from()` takes that `URLSearchParams.ish` and gives you a `URLSearchParams` object.

`URLSearchParams.toString()` takes that `URLSearchParams.ish` and gives you a query string (with a leading `?` if there are arguments in the string).

`URLSearchParams.merge()` merges together two possibly-undefined `URLSearchParams.ish` values into a single `URLSearchParams` object (or `undefined` if both are `undefined`).

`URLSearchParams.appendTo()` appends a `URLSearchParams.ish` to a `URL.ish` value, replacing the existing query string.

### `Headers`

`Headers.ish` could be a `Headers` object, a `HeadersInit` from the Fetch API `RequestInit`, an associative array of strings (`Record<string,string>`) or an enty list (`[string,string][]`).

`Headers.from()` takes that `Headers.ish` and gives you a `Headers` object.

`Headers.merge()` merges two possibly-undefined `Headers.ish` values into a single `Headers.ish` value (or undefined if both are undefined).

### `Body`

`Body.ish` could be a `FetchBody` from `openid-client`, `FormData`, an associative array fo string (`Record<string,string>`), or any variant of the `RequestInit` body parameter from the Fetch API.

`Body.from()` takes that `Body.ish` and gives you a `FetchBody` object.
