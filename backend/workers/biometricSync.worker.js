const dayjs = require("../utils/dayjs");
const DeviceLog = require("../models/dmpsDeviceLog.model");
const { biometricIngest } = require("../controllers/biometricAttendance.controller");

const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL_MS || 5000);
const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE || 20);

// 🔁 Mock req/res wrapper
function createMockReqRes(payload) {
  return {
    req: {
      body: payload,
      headers: {
        "x-api-key": process.env.BIOMETRIC_API_KEY,
      },
    },
    res: {
      status: (code) => ({
        json: (data) => console.log(`🔸 Response ${code}`, data),
      }),
      json: (data) => console.log("🔹 Response", data),
    },
  };
}

// async function processLogs() {
//   try {
//     const logs = await DeviceLog.findAll({
//       where: { IsSync: 0 },
//       order: [["Id", "ASC"]],
//       limit: BATCH_SIZE,
//     });

//     if (!logs.length) {
//       return;
//     }

//     console.log(`🚀 Processing ${logs.length} biometric logs...`);

//     for (const log of logs) {
//       try {
//         const payload = {
//           employee_code: log.UserId,
//           log_datetime: dayjs(log.IOTime).format("YYYY-MM-DD HH:mm:ss"),
//           log_time: dayjs(log.IOTime).format("HH:mm:ss"),
//           device_sn: log.DeviceKey,
//         };

//         const { req, res } = createMockReqRes(payload);

//         await biometricIngest(req, res);

//         await log.update({ IsSync: 1 });

//       } catch (err) {
//         console.error(`❌ Failed for log ID ${log.Id}:`, err.message);
//       }
//     }

//   } catch (err) {
//     console.error("🔥 Worker error:", err.message);
//   }
// }

async function processLogs() {
  try {
    const logs = await DeviceLog.findAll({
      where: { IsSync: 0 },
      order: [["Id", "ASC"]],
      limit: BATCH_SIZE,
    });

    if (!logs.length) return;

    console.log(`🚀 Processing ${logs.length} biometric logs...`);

    for (const log of logs) {
      try {
        console.log("➡️ Processing:", log.Id, log.IOTime);

        const payload = {
          employee_code: log.UserId,
          log_datetime: dayjs(log.IOTime).format("YYYY-MM-DD HH:mm:ss"),
          log_time: dayjs(log.IOTime).format("HH:mm:ss"),
          device_sn: log.DeviceKey,
        };

        const { req, res } = createMockReqRes(payload);

        const result = await biometricIngest(req, res);

        
          await log.update({ IsSync: 1 });
        

      } catch (err) {
        console.error(`❌ Failed for log ID ${log.Id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("🔥 Worker error:", err.message);
  }
}

// ⏱ run loop
setInterval(processLogs, SYNC_INTERVAL);

console.log("🟢 Biometric Sync Worker Started...");