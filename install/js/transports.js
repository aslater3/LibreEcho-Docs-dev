// Transport adapter.
//
// The protocol implementations live in ../lib (fastboot.js, adb.js and their
// WebUSB transports). This module is the single place that knows their export
// shape, so a change there touches one file here and nothing in the stage code.

import { MODES } from "./device.js";

const FASTBOOT_MODULE = "./lib/fastboot.js";
const FASTBOOT_TRANSPORT = "./lib/webusb-fastboot-transport.js";
const ADB_MODULE = "./lib/adb.js";
const ADB_TRANSPORT = "./lib/webusb-adb-transport.js";

async function importOrNull(path) {
  try {
    return await import(path);
  } catch (error) {
    return { __error: error };
  }
}

function requireExport(module, names, path) {
  if (module?.__error) {
    return { ok: false, reason: `${path} failed to load: ${module.__error.message}` };
  }
  for (const name of names) {
    if (typeof module[name] === "function") return { ok: true, value: module[name] };
  }
  return { ok: false, reason: `${path} exports none of: ${names.join(", ")}` };
}

export async function protocolSupport() {
  const fastboot = await importOrNull(FASTBOOT_MODULE);
  const fastbootTransport = await importOrNull(FASTBOOT_TRANSPORT);
  const adb = await importOrNull(ADB_MODULE);
  const adbTransport = await importOrNull(ADB_TRANSPORT);
  return {
    fastboot: requireExport(fastboot, ["FastbootClient"], FASTBOOT_MODULE),
    fastbootTransport: requireExport(
      fastbootTransport,
      ["UsbFastbootTransport", "WebUsbFastbootTransport", "openFastbootTransport"],
      FASTBOOT_TRANSPORT,
    ),
    adb: requireExport(adb, ["AdbClient"], ADB_MODULE),
    adbTransport: requireExport(
      adbTransport,
      ["UsbAdbTransport", "WebUsbAdbTransport", "openAdbTransport"],
      ADB_TRANSPORT,
    ),
  };
}

export async function openFastboot({ device, onLog } = {}) {
  const support = await protocolSupport();
  if (!support.fastboot.ok) throw new Error(support.fastboot.reason);
  if (!support.fastbootTransport.ok) throw new Error(support.fastbootTransport.reason);
  const usbDevice = device ?? (await navigator.usb.requestDevice({ filters: MODES.fastboot.filters }));
  const transport = await support.fastbootTransport.value(usbDevice);
  const client = new support.fastboot.value(transport);
  if (onLog) onLog(`fastboot transport open: ${usbDevice.vendorId}:${usbDevice.productId}`);
  return { device: usbDevice, transport, client };
}

export async function openAdb({ device, onLog } = {}) {
  const support = await protocolSupport();
  if (!support.adb.ok) throw new Error(support.adb.reason);
  if (!support.adbTransport.ok) throw new Error(support.adbTransport.reason);
  const usbDevice = device ?? (await navigator.usb.requestDevice({ filters: MODES.adb.filters }));
  const transport = await support.adbTransport.value(usbDevice);
  const client = new support.adb.value(transport);
  const info = await client.connect({ banner: "host::libreecho-browser-installer" });
  if (onLog) {
    onLog(`adb transport open: ${usbDevice.vendorId}:${usbDevice.productId}`);
    if (info?.deviceBanner) onLog(`device banner: ${info.deviceBanner}`);
  }
  return { device: usbDevice, transport, client, info };
}
