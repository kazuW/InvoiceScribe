// --------------------------
// Example with websockets:
// --------------------------

const WebSocket = require('ws');
const fs = require('fs');

const REST_HOST = 'localhost:8080'
const MACAROON_PATH = 'マカルーンのパス/admin.macaroon'

const https = require("https")

const accessToken = "LINEのアクセストークン"

const options = {
    hostname: "notify-api.line.me",
    path: "/api/notify",
    method: "POST",
    headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${accessToken}`
    }
}

let ws = new WebSocket(`wss://${REST_HOST}/v1/invoices/subscribe?method=GET`, {
  // Work-around for self-signed certificates.
  rejectUnauthorized: false,
  headers: {
    'Grpc-Metadata-Macaroon': fs.readFileSync(MACAROON_PATH).toString('hex'),
  },
});

ws.on('error', function(err) {
    console.log('Error: ' + err);
});
ws.on('message', function(body) {
    const parsed = JSON.parse(body.toString('utf-8'))
    var content = `${parsed.result.memo}(${parsed.result.value} sat)`

    if (parsed.result.settled == true) {
      console.log("Lineに通知！")

      const request = https.request(options, res => {
        res.setEncoding("utf8")
        res.on("data", console.log)
        res.on("error", console.log)
      })

      content += "は決済されました。"
      request.write(
        new URLSearchParams({ message: content, stickerPackageId: 11537, stickerId: 52002734 }).toString()
      )
      request.end()
    }else{
      content += "のInvoiceが作成されました。"
      console.log(content);
    }
});

// Console output:
//  {
//    "memo": <string>, // <string>
//    "r_preimage": <string>, // <bytes>
//    "r_hash": <string>, // <bytes>
//    "value": <string>, // <int64>
//    "value_msat": <string>, // <int64>
//    "settled": <boolean>, // <bool>
//    "creation_date": <string>, // <int64>
//    "settle_date": <string>, // <int64>
//    "payment_request": <string>, // <string>
//    "description_hash": <string>, // <bytes>
//    "expiry": <string>, // <int64>
//    "fallback_addr": <string>, // <string>
//    "cltv_expiry": <string>, // <uint64>
//    "route_hints": <array>, // <RouteHint>
//    "private": <boolean>, // <bool>
//    "add_index": <string>, // <uint64>
//    "settle_index": <string>, // <uint64>
//    "amt_paid": <string>, // <int64>
//    "amt_paid_sat": <string>, // <int64>
//    "amt_paid_msat": <string>, // <int64>
//    "state": <string>, // <InvoiceState>
//    "htlcs": <array>, // <InvoiceHTLC>
//    "features": <object>, // <FeaturesEntry>
//    "is_keysend": <boolean>, // <bool>
//    "payment_addr": <string>, // <bytes>
//    "is_amp": <boolean>, // <bool>
//    "amp_invoice_state": <object>, // <AmpInvoiceStateEntry>
//  }