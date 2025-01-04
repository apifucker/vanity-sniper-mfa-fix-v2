"use strict";
// bu kod github.com/duckevils tarafından yazılmıştır.
// discord.gg/1937 1978
// duckevils rush ingiltereli zons ash noex
import tls from 'tls';
import WebSocket from 'ws';
import extractJsonFromString from 'extract-json-from-string';
import colors from 'colors';
import http2 from 'http2';
import axios from 'axios';


const config = {
    discordHost: "canary.discord.com",
    webhook: "",
    password: "",
    discordToken: "",
    guildId: "",
    gatewayUrl: "wss://gateway-us-east1-b.discord.gg",
    os: "linux",
    browser: "Maxthon",
    device: "duckevilsxrushxingilterelixzonsxashxnoex"
};

let mfaToken;
let vanity;
const guilds = {};

const tlsSocket = tls.connect({ host: config.discordHost, port: 8443 });

tlsSocket.on("data", async (data) => {
    const ext = extractJsonFromString(data.toString());
    const find = ext.find((e) => e.code) || ext.find((e) => e.message);
    if (find) {
        console.log(find);
    }
});

tlsSocket.on("error", (error) => {
    console.log(`tls error`, error);
    process.exit();
});

tlsSocket.on("end", () => {
    console.log("tls connection closed");
    process.exit();
});

tlsSocket.on("secureConnect", () => {
    const websocket = new WebSocket(config.gatewayUrl);

    websocket.onclose = (event) => {
        console.log(`ws connection closed ${event.reason} ${event.code}`);
        process.exit();
    };

    websocket.onmessage = async (message) => {
        const { d, op, t } = JSON.parse(message.data);
        if (t === "GUILD_UPDATE") {
            const find = guilds[d.guild_id];
            if (find && find !== d.vanity_url_code) {
                ticket(find);
                notifyWebhook(find);
                vanity = `${find}`;
            }
        } 
        else if (t === "READY") {
            d.guilds.forEach((guild) => {
                if (guild.vanity_url_code) {
                    guilds[guild.id] = guild.vanity_url_code; 
                    console.log(`\x1b[35m1937x1978\x1b[0m || \x1b[31mGUILD => ${guild.id}\x1b[0m || \x1b[34mVANITY => ${guild.vanity_url_code}\x1b[0m`);
                }
            });
            
        console.log(`\x1b[31mduckevils wishes you a good flight!\x1b`);
        }
        
async function notifyWebhook(find) {
  const requestBody = {
    content: `*⌜ code : ' ${find} ' ⌟* ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||ً @everyone @here https://tenor.com/view/akame-akame-ga-k-ill-anime-fighting-stance-windy-gif-17468654`
  };

  try {
    await axios.post(config.webhook, requestBody);
  } catch (error) {
    console.error('Failed to notify webhook:', error);
  }
}
        if (op === 10) {
            websocket.send(JSON.stringify({
                op: 2,
                d: {
                    token: config.discordToken,
                    intents: 513,
                    properties: {
                        os: config.os,
                        browser: config.browser,
                        device: config.device,
                    },
                },
            }));
            setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);
        } else if (op === 7) {
            process.exit();
        }
    };

    setInterval(() => {
        tlsSocket.write(["GET / HTTP/1.1", `Host: ${config.discordHost}`, "", ""].join("\r\n"));
    }, 600);
});

async function ticket(find) {
  try {
      const initialResponse = await http2Request("PATCH", `/api/v9/guilds/${config.guildId}/vanity-url`, headers);
      const data = JSON.parse(initialResponse);
      if (data.code === 200) {
          vanityUpdate();
      } else if (data.code === 60003) {
          const ticket = data.mfa.ticket;
          await mfa(ticket, find);
      } else {
          console.log(colors.red("HATA:", data.code));
      }
  } catch (error) {
      console.error(colors.red("HATA:", error));
  }
}

async function mfa(ticket, find) {
  try {
      const mfaResponse = await http2Request(
          "POST",
          "/api/v9/mfa/finish",
          {
              ...headers,
              "Content-Type": "application/json",
          },
          JSON.stringify({
              ticket: ticket,
              mfa_type: "password",
              data: config.password,
          })
      );
      const responseData = JSON.parse(mfaResponse);
      if (responseData.token) {
          mfaToken = responseData.token;
          vanityUpdate(find);
      } else {
          throw new Error(`HATA: ${JSON.stringify(responseData)}`);
      }
  } catch (error) {
      console.error(colors.red("HATA:", error));
  }
}


const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) duckevils/1.0.9164 Chrome/124.0.6367.243 Electron/30.2.0 Safari/537.36',
    'X-Debug-Options': 'bugReporterEnabled',
    'Authorization': config.discordToken,
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'X-Audit-Log-Reason': '',
    'X-Context-Properties': 'nosniff',
    'X-Discord-Locale': 'tr',
    'X-Discord-Timezone': 'Europe/Istanbul',
    'X-Super-Properties': 'eyJvcyI6IkFuZHJvaWQiLCJicm93c2VyIjoiQW5kcm9pZCBDaHJvbWUiLCJkZXZpY2UiOiJBbmRyb2lkIiwic3lzdGVtX2xvY2FsZSI6InRyLVRSIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzMS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMxLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tL2NoYW5uZWxzL0BtZS8xMzAzMDQ1MDIyNjQzNTIzNjU1IiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM1NTYyNCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZX0='
};

async function vanityUpdate(find) {
    try {
        const vanityResponse = await http2Request('PATCH', `/api/v9/guilds/${config.guildId}/vanity-url`, {
            ...headers,
            'X-Discord-MFA-Authorization': mfaToken,
            'Cookie': `__Secure-recent_mfa=${mfaToken}`,
            'Content-Type': 'application/json'
        }, JSON.stringify({ code: find }));
        const vanityData = JSON.parse(vanityResponse);
        if (vanityData.code === 200) {
            console.log('Vanity URL alındı:', vanityData);
        } else {
            console.error(' UPDATE:', vanityData);
        }
    } catch (error) {
        console.error('Vanity URL isteği hatası:', error);
    }
}

async function http2Request(method, path, customHeaders = {}, body = null) {
    return new Promise((resolve, reject) => {
        const client = http2.connect("https://canary.discord.com");
        const req = client.request({
            ":method": method,
            ":path": path,
            ...customHeaders,
        });
        let data = "";
        req.on("response", (headers, flags) => {
            req.on("data", (chunk) => {
                data += chunk;
            });
            req.on("end", () => {
                resolve(data);
                client.close();
            });
        });
        req.on("error", (err) => {
            reject(err);
            client.close();
        });
        if (body) {
            req.write(body);
        }
        req.end();
    });
}
process.title = "Zafer Allah'ın yanında olanındır.";
// we are allah's soldiers
